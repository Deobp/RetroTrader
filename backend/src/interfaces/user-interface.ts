import { Document } from "mongoose";


export default interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin" | "subscriber" | "guest";
  plan: "free" | "premium" | "vip" | "exclusive";
  createdAt: Date;
  updateUsername: (newUsername: string) => Promise<IUser>;
  updatePassword: (newPassword: string) => Promise<IUser>;
  updateEmail: (newEmail: string) => Promise<IUser>;
}