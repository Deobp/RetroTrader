import bcrypt from "bcrypt";
import User from "../models/user-model";
import { createToken } from "../utils/jwt";
import { UserError } from "../utils/user-error";
import { Request, Response, NextFunction } from "express";


const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password, role, plan } = req.body;

    console.log('Registration Input:');
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Password Length:', password.length);

    if (!username || !email || !password) {
      throw new UserError("All fields are required.", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new UserError("Email is already registered.", 409);
    }

    //pre-save hook handle hashing
    const newUser = await User.create({
      username,
      email,
      password,
      role,
      plan,
    });

    res.status(201).json({
      message: "User registered successfully.",
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('Login Input:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Password Length:', password.length);

    if (!email || !password) {
      throw new UserError("Email and password are required.", 400);
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`Login attempt with non-existent email: ${email}`);
      throw new UserError("User not found", 401);
    }

    console.log('Stored hashed password:', user.password);
    console.log('Stored password length:', user.password.length);

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      throw new UserError("Invalid email or password.", 401);
    }

    const token = createToken({ id: user.id, role: user.role });
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000,
    });
    console.log('Generated Token:', token);


    res.status(200).json({ message: "Login successful.", token });
  } catch (error) {
    console.error('Detailed Login Error:', error);
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new UserError("Unauthorized. User ID is missing.", 401);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new UserError("User not found.", 404);
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { username, email, password } = req.body;

    if (!userId) {
      throw new UserError("Unauthorized. User ID is missing.", 401);
    }

    const updates: Partial<{ username: string; email: string; password: string }> = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (password) updates.password = bcrypt.hashSync(password, SALT_ROUNDS);

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

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new UserError("Unauthorized. User ID is missing.", 401);
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new UserError("User not found.", 404);
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
};
