import mongoose, { Schema, Document, Model } from "mongoose";
import { Response } from "express";
import bcrypt from "bcrypt";
import IUser from "../interfaces/user-interface";
import { NextFunction } from "express";
import { UserError } from "../utils/user-error";

const usernameRegex = /^[a-z][a-z0-9]*$/;
const passRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};:'",.<>/?\\|`~])[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};:'",.<>/?\\|`~]{8,}$/;
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const UserSchema: Schema<IUser> = new Schema<IUser>({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    validate: {
      validator: (v: string) => usernameRegex.test(v),
      message: "Invalid username format (must start with a letter and contain only lowercase letters and numbers)",
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: {
      validator: (v: string) => emailRegex.test(v),
      message: "Invalid email format",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    validate: {
      validator: (v: string) => passRegex.test(v),
      message:
        "Password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character",
    },
  },
  role: {
    type: String,
    required: true,
    enum: ["user", "admin", "subscriber", "guest"],
    default: "user",
  },
  plan: {
    type: String,
    enum: ["free", "premium", "vip", "exclusive"],
    default: "free",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//hash pass before saving the document
UserSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
      this.password = await bcrypt.hash(this.password, saltRounds);
      next();
    } catch (err) {
      next(err as Error);
    }
  } else {
    next();
  }
});

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { username, email, password } = req.body as unknown as { username: string; email: string; password: string };

    if (!userId) {
      throw new UserError("Unauthorized. User ID is missing.", 401);
    }

    const updates: Partial<{ username: string; email: string; password: string }> = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (password) {
      //async hash method
      updates.password = await bcrypt.hash(password, process.env.SALT_ROUNDS || 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
    if (!updatedUser) {
      throw new UserError("User not found.", 404);
    }

    res.status(200).json({
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

UserSchema.methods.updateUsername = async function (newUsername: string): Promise<IUser> {
  this.username = newUsername;
  return this.save();
};

UserSchema.methods.updatePassword = async function (newPassword: string): Promise<IUser> {
  if (!passRegex.test(newPassword)) {
    throw new Error(
      "Password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character"
    );
  }
  const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
  //async hash method
  this.password = await bcrypt.hash(newPassword, saltRounds);
  return this.save();
};

UserSchema.methods.updateEmail = async function (newEmail: string): Promise<IUser> {
  if (!emailRegex.test(newEmail)) {
    throw new Error("Invalid email format");
  }
  this.email = newEmail;
  return this.save();
};

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
