import { User, IUser } from "../models/User";
import { UserRole } from "../types";
import { NotificationService } from "./NotificationService";
import { Types } from "mongoose";
import { Referral } from "../models/Referral";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";

/**
 * IMPORTANT:
 * Use WEB CLIENT ID (not Android / iOS)
 */
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Resolves Google user info from either:
 * - ID TOKEN (JWT)
 * - ACCESS TOKEN
 */
async function getGoogleUserFromToken(token: string): Promise<{
  email: string;
  sub: string;
  name?: string;
  picture?: string;
}> {
  // Try ID token verification
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      throw new Error("Invalid ID token payload");
    }

    return {
      email: payload.email,
      sub: payload.sub,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (err) {
    // Ignore and fallback to access token
  }

  // Fallback: Access token via UserInfo API
  try {
    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!data?.email || !data?.sub) {
      throw new Error("Invalid access token response");
    }

    return {
      email: data.email,
      sub: data.sub,
      name: data.name,
      picture: data.picture,
    };
  } catch (err) {
    throw new Error("Invalid Google token (neither ID nor access token)");
  }
}

export class UserService {
  static async findOrCreateFromGoogle(
    name: string,
    token: string,
    phone?: string,
    city?: string,
    state?: string,
    country?: string,
    pincode?: string,
    role?: UserRole,
    age?: number,
    classLevel?: Types.ObjectId,
    classOther?: string,
    upiId?: string,
    referralCode?: string
  ): Promise<IUser> {
    const googleUser = await getGoogleUserFromToken(token);
    
    let user = await User.findOne({
      $or: [{ email: googleUser.email }, { googleId: googleUser.sub }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleUser.sub;
        await user.save();
      }
      return user;
    }

    let referrerUser: IUser | null = null;

    if (referralCode) {
      referrerUser = await User.findOne({
        referralCode,
        role: "teacher",
        isDeleted: false,
      });
    }

    const userData: Partial<IUser> = {
      name: name || googleUser.name || "",
      email: googleUser.email,
      googleId: googleUser.sub,
      phone,
      pincode,
      city,
      state,
      country,
      role: role || "student",
      upiId,
      referredBy: referrerUser?._id as Types.ObjectId,
    };

    

    if (userData.role === "student") {
      if (age) {
        userData.age = age;
      }

      if (classLevel) {
        userData.classLevel = classLevel;
      }

      if (classOther) {
        userData.classOther = classOther;
      }
    }

    if (userData.role === 'parent'){
      userData.pincode = userData.pincode;
    }

    user = new User(userData);
    await user.save();

    if (
      referrerUser &&
      userData.role === "teacher" &&
      !(referrerUser._id as Types.ObjectId).equals(user._id as Types.ObjectId)
    ) {
      await Referral.create({
        referrer: referrerUser._id,
        referee: user._id,
      });
    }

    if (userData.role === "teacher") {
      await NotificationService.notifyTeacherSignup(
        user._id as Types.ObjectId,
        user.name
      );
    }

    return user;
  }

  static async findById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  static async updateProfile(
    userId: string,
    updates: Partial<IUser>
  ): Promise<IUser | null> {
    const allowedUpdates = { ...updates };

    delete allowedUpdates.email;
    delete allowedUpdates.googleId;
    delete allowedUpdates.role;
    delete allowedUpdates.studentCode;
    delete allowedUpdates.approvalStatus;

    return User.findByIdAndUpdate(userId, allowedUpdates, { new: true });
  }
}
