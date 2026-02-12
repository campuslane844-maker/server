import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { Admin } from "../models/Admin";
import { generateToken, generateAdminToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticationError } from "../utils/errors";
import { UserRole } from "../types";
import mongoose from "mongoose";

export class AuthController {
  static googleSignIn = asyncHandler(async (req: Request, res: Response) => {
    const { idToken, role, name, phone, city, state, country, pincode, age, classLevel, classOther, upiId } =
      req.body;
    const referralCode = req.query.ref as string | undefined;
    console.log(req.body)
    const user = (await UserService.findOrCreateFromGoogle(
      name,
      idToken,
      phone,
      city,
      state,
      country,
      pincode,
      role as UserRole,
      age,
      classLevel as mongoose.Types.ObjectId,
      classOther,
      upiId,
      referralCode
    )) as {
      name: string;
      _id: string | { toString(): string };
      role: UserRole;
      phone: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
      classLevel?: mongoose.Types.ObjectId,
      classOther?: string,
      upiId?: string;
      referralCode?: string
    };

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        user,
      },
    });
  });

  static adminLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin || !(await admin.comparePassword(password))) {
      throw new AuthenticationError("Invalid email or password");
    }

    const token = generateAdminToken({
      adminId: (admin._id as string | { toString(): string }).toString(),
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
        },
      },
    });
  });

  static getMe = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore – injected by auth middleware
  const userId = req.user?.userId;

  if (!userId) {
    throw new AuthenticationError("Unauthorized");
  }

  const user = await UserService.findById(userId);

  if (!user || user.isDeleted) {
    throw new AuthenticationError("User not found");
  }

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

}
