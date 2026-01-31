import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { User } from "../models/User";
import { Content } from "../models/Content";
import { generatePresignedUrl } from "../config/aws";
import { asyncHandler } from "../utils/asyncHandler";
import { NotFoundError, ValidationError } from "../utils/errors";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";
import { ParentChildLink } from "../models/ParentChildLink";
import { TeacherPlan } from "../models/TeacherPlan";
import { TeacherSubscription } from "../models/TeacherSubscription";
import { assertTeacherCanUpload } from "./TeacherSubscriptionController";
import {
  createRazorpayContact,
  createUpiFundAccount,
} from "../services/PaymentService";
import { TeacherPayoutProfile } from "../models/TeacherPayoutProfile";
import { PlatformConfig } from "../models/PlatformConfig";
import { Referral } from "../models/Referral";
const MAX_REFERRAL_REWARDS = 3;

export class AdminController {
  static getTeachers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { status, search, page, limit } = req.query as any;
      const { skip } = getPaginationParams(req.query);

      const filter: any = {
        role: "teacher",
        isDeleted: false,
      };

      if (status) {
        filter.approvalStatus = status;
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const [teachers, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
      ]);

      const result = createPaginationResult(teachers, total, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static getTeacherById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const teacher = await User.findById(id);

      const content = await Content.find({
        uploaderId: id,
        isDeleted: false,
      });

      if (!teacher) {
        throw new NotFoundError("Teacher not found");
      }

      res.status(200).json({
        success: true,
        data: {
          teacher,
          content,
        },
      });
    }
  );

  static updateTeacher = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const teacher = await User.findOneAndUpdate(
        { _id: id, isDeleted: false },
        req.body,
        { new: true, runValidators: true }
      );

      if (!teacher) {
        throw new NotFoundError("Teacher not found");
      }

      res.status(200).json({
        success: true,
        data: teacher,
      });
    }
  );

  static deleteTeacher = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const teacher = await User.findById(id);
      if (!teacher || teacher.isDeleted) {
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      }

      // Soft delete
      teacher.isDeleted = true;
      await teacher.save();

      return res
        .status(200)
        .json({ success: true, message: "Teacher deleted successfully" });
    }
  );

  static approveTeacher = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      // Fetch teacher (NOT update yet)
      const teacher = await User.findOne({
        _id: id,
        role: "teacher",
        isDeleted: false,
        approvalStatus: { $ne: "approved" },
      });

      if (!teacher) {
        throw new Error("Teacher already approved or not found");
      }

      if (!teacher.upiId) {
        throw new Error("Teacher UPI ID not provided");
      }

      // Create Razorpay Contact
      let contact;
      try {
        contact = await createRazorpayContact({
          name: teacher.name,
          email: teacher.email,
          contact: teacher.phone,
          referenceId: `teacher_${teacher._id}`,
        });
        console.log(contact);
      } catch (err: any) {
        console.error("RAZORPAY FUND ACCOUNT ERROR", err?.error || err);
        throw new Error("Failed to create Razorpay contact");
      }

      // Create UPI Fund Account
      let fundAccount;
      try {
        fundAccount = await createUpiFundAccount({
          contactId: contact.id,
          upiId: teacher.upiId,
        });
        console.log(fundAccount);
      } catch (err: any) {
        throw new Error("Invalid UPI ID. Please ask teacher to update.");
      }

      // Save payout profile (idempotent)
      await TeacherPayoutProfile.updateOne(
        { teacherId: teacher._id },
        {
          teacherId: teacher._id,
          contactId: contact.id,
          fundAccountId: fundAccount.id,
          method: "upi",
          active: true,
        },
        { upsert: true }
      );

      // Approve teacher
      teacher.approvalStatus = "approved";
      await teacher.save();

      // Assign FREE plan
      const freePlan = await TeacherPlan.findOne({
        code: "free",
        isActive: true,
      });

      if (!freePlan) {
        throw new Error("Free plan not configured");
      }

      const now = new Date();

      await TeacherSubscription.updateOne(
        { teacherId: teacher._id, isFree: true },
        {
          $setOnInsert: {
            planCode: "free",
            uploadLimit: freePlan.uploadLimit,
            uploadsUsed: 0,
            isFree: true,
            status: "active",
            startDate: new Date(),
            endDate: new Date(
              now.setDate(now.getDate() + (freePlan.durationDays ?? 0))
            ),
          },
        },
        { upsert: true }
      );

      // REFERRAL REWARD LOGIC (after approval)
      const referral = await Referral.findOne({
        referee: teacher._id,
        rewardGranted: false,
      });

      if (referral) {
        // Count already rewarded referrals for this referrer
        const rewardedCount = await Referral.countDocuments({
          referrer: referral.referrer,
          rewardGranted: true,
        });

        // Cap check
        if (rewardedCount >= MAX_REFERRAL_REWARDS) {
          console.log(
            `[REFERRAL] Reward cap reached for referrer ${referral.referrer}`
          );
        } else {
          const referrerSubscription = await TeacherSubscription.findOne({
            teacherId: referral.referrer,
            status: "active",
          });

          if (
            referrerSubscription &&
            referrerSubscription.uploadLimit !== null
          ) {
            referrerSubscription.uploadLimit += 10;
            await referrerSubscription.save();
          }

          referral.rewardGranted = true;
          await referral.save();

          console.log(
            `[REFERRAL] Reward granted (${
              rewardedCount + 1
            }/${MAX_REFERRAL_REWARDS})`
          );
        }
      }

      res.status(200).json({
        success: true,
        data: teacher,
        message: "Teacher approved and payout setup completed",
      });
    }
  );

  static rejectTeacher = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const { feedback } = req.body;

      const teacher = await User.findOneAndUpdate(
        { _id: id, role: "teacher", isDeleted: false },
        { approvalStatus: "rejected", feedback },
        { new: true }
      );

      if (!teacher) {
        throw new NotFoundError("Teacher not found");
      }

      res.status(200).json({
        success: true,
        data: teacher,
        message: "Teacher rejected successfully",
      });
    }
  );

  static getContentForApproval = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const {
        approvalStatus,
        classId,
        subjectId,
        chapterId,
        q,
        page,
        limit,
        includeDeleted,
      } = req.query as any;

      const { skip } = getPaginationParams(req.query);

      const filter: any = {};

      if (!includeDeleted) {
        filter.isDeleted = false;
      }

      if (approvalStatus) filter.approvalStatus = approvalStatus;
      if (classId) filter.classId = classId;
      if (subjectId) filter.subjectId = subjectId;
      if (chapterId) filter.chapterId = chapterId;

      if (q) {
        filter.$text = { $search: q };
      }

      const [content, total] = await Promise.all([
        Content.find(filter)
          .populate("classId", "name")
          .populate("subjectId", "name")
          .populate("chapterId", "name")
          .populate("uploaderId", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Content.countDocuments(filter),
      ]);

      const result = createPaginationResult(content, total, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static approveContent = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const { feedback } = req.body;

      const content = await Content.findOneAndUpdate(
        {
          _id: id,
          isDeleted: false,
          approvalStatus: { $ne: "approved" }, // idempotent
        },
        {
          approvalStatus: "approved",
          feedback,
          approvedAt: new Date(),
        },
        { new: true }
      );

      if (!content) {
        throw new Error("Content already approved or not found");
      }

      /**
       * Increment upload count ONLY for teacher content
       * using unified subscription resolution
       */
      if (content.uploaderRole === "teacher") {
        try {
          const subscription = await assertTeacherCanUpload(
            content.uploaderId.toString()
          );

          await TeacherSubscription.updateOne(
            { _id: subscription._id },
            { $inc: { uploadsUsed: 1 } }
          );
        } catch (err: any) {
          if (err.message === "Upload limit reached") {
            await Content.updateOne(
              { _id: content._id },
              {
                approvalStatus: "rejected",
                feedback: "Upload limit exceeded. Please upgrade plan.",
              }
            );
          }
          throw err;
        }
      }

      res.status(200).json({
        success: true,
        data: content,
        message: "Content approved successfully",
      });
    }
  );

  static rejectContent = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const { feedback } = req.body;

      const content = await Content.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { approvalStatus: "rejected", feedback },
        { new: true }
      );

      if (!content) {
        throw new NotFoundError("Content not found");
      }

      res.status(200).json({
        success: true,
        data: content,
        message: "Content rejected successfully",
      });
    }
  );

  static getStudents = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { search, page, limit } = req.query as any;
      const { skip } = getPaginationParams(req.query);

      const filter: any = {
        role: "student",
        isDeleted: false,
      };

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const [students, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
      ]);

      const result = createPaginationResult(students, total, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static getStudentById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const student = await User.findById(id);

      res.status(200).json({
        success: true,
        data: student,
      });
    }
  );

  static updateStudent = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const student = await User.findOneAndUpdate(
        { _id: id, isDeleted: false },
        req.body,
        { new: true, runValidators: true }
      );

      if (!student) {
        throw new NotFoundError("Student not found");
      }

      res.status(200).json({
        success: true,
        data: student,
      });
    }
  );

  static deleteStudent = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const student = await User.findById(id);
      if (!student || student.isDeleted) {
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      }

      // Soft delete
      student.isDeleted = true;
      await student.save();

      return res
        .status(200)
        .json({ success: true, message: "Student deleted successfully" });
    }
  );

  static getParents = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { search, page, limit } = req.query as any;
      const { skip } = getPaginationParams(req.query);

      const filter: any = {
        role: "parent",
        isDeleted: false,
      };

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const [parents, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
      ]);

      const result = createPaginationResult(parents, total, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static getParentById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const parent = await User.findById(id);
      if (!parent) {
        throw new NotFoundError("Parent not found");
      }

      const parentChildLinks = await ParentChildLink.find({
        parentId: id,
      }).populate("studentId");
      const children = parentChildLinks.map((item) => {
        return item.studentId;
      });

      res.status(200).json({
        success: true,
        data: {
          parent,
          children,
        },
      });
    }
  );

  static updateParent = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const parent = await User.findOneAndUpdate(
        { _id: id, isDeleted: false },
        req.body,
        { new: true, runValidators: true }
      );

      if (!parent) {
        throw new NotFoundError("Parent not found");
      }

      res.status(200).json({
        success: true,
        data: parent,
      });
    }
  );

  static deleteParent = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const parent = await User.findById(id);
      if (!parent || parent.isDeleted) {
        return res
          .status(404)
          .json({ success: false, message: "Parent not found" });
      }

      // Soft delete
      parent.isDeleted = true;
      await parent.save();

      return res
        .status(200)
        .json({ success: true, message: "Parent deleted successfully" });
    }
  );

  static generatePresignedUrl = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { contentType } = req.body;

      // Validate content type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/mp3",
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "video/quicktime",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];

      if (!allowedTypes.includes(contentType)) {
        throw new ValidationError("Unsupported file type");
      }

      // Generate unique key
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const key = `uploads/${timestamp}-${randomString}`;

      const presignedData = await generatePresignedUrl(key, contentType);

      res.status(200).json({
        success: true,
        data: presignedData,
      });
    }
  );
}

export const updatePayPerView = asyncHandler(async (req, res) => {
  const { payPerView } = req.body;

  if (payPerView < 0) {
    throw new Error("Invalid pay per view");
  }

  const config = await PlatformConfig.findOneAndUpdate(
    {},
    { payPerView },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    data: config,
  });
});
