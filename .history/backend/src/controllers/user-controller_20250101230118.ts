import bcrypt from 'bcrypt';
import User from '../models/user-model';
import { createToken } from '../utils/jwt';
import { UserError } from '../utils/user-error';
import { Request, Response, NextFunction } from 'express';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

// export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const { username, email, password, role, plan } = req.body;

//     if (!username || !email || !password) {
//       throw new UserError('All fields are required.', 400);
//     }

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       throw new UserError('Email is already registered.', 409);
//     }

//     const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       role,
//       plan,
//     });

//     res.status(201).json({
//       message: 'User registered successfully.',
//       user: { id: newUser.id, username: newUser.username, email: newUser.email },
//     });
//   } catch (error) {
//     next(error);
//   }
// };
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Request body for registration:', req.body);

    const { username, email, password, role, plan } = req.body;

    if (!username || !email || !password) {
      throw new UserError('All fields are required.', 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    console.log('Existing user:', existingUser);

    if (existingUser) {
      throw new UserError('Email is already registered.', 409);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log('Registration input password:', password);
    console.log('Hashed password (registration):', hashedPassword);

    const newUser = await User.create({
      username,
      email,
      password,
      role,
      plan,
    });

    console.log('New user created:', newUser);

    res.status(201).json({
      message: 'User registered successfully.',
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    next(error);
  }
};

// export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       throw new UserError('Email and password are required.', 400);
//     }

//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       throw new UserError('User not found.', 401);
//     }

//     const isPasswordCorrect = await bcrypt.compare(password, user.password);
//     if (!isPasswordCorrect) {
//       throw new UserError('Invalid email or password.', 401);
//     }

//     const token = createToken({ id: user.id, role: user.role });
//     res.cookie('token', token, {
//       httpOnly: true,
//       maxAge: 3600000, // 1 hour
//     });

//     res.status(200).json({ message: 'Login successful.', token });
//   } catch (error) {
//     next(error);
//   }
// };

//test one
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Login request body:', req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      throw new UserError('Email and password are required.', 400);
    }

    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'email', 'password', 'role'],
    });

    if (!user) {
      console.error('User not found with email:', email);
      throw new UserError('User not found.', 401);
    }

    console.log('User found:', user.email);

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      throw new UserError('Invalid email or password.', 401);
    }

    const token = createToken({ id: user.id, role: user.role });
    console.log('Generated token:', token);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({ message: 'Login successful.', token });
  } catch (error) {
    console.error('Error in loginUser:', error);
    next(error);
  }
};


export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new UserError('Unauthorized. User ID is missing.', 401);
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      throw new UserError('User not found.', 404);
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
      throw new UserError('Unauthorized. User ID is missing.', 401);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new UserError('User not found.', 404);
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, SALT_ROUNDS);

    await user.save();

    res.status(200).json({
      message: 'User updated successfully.',
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new UserError('Unauthorized. User ID is missing.', 401);
    }

    const deletedUser = await User.destroy({ where: { id: userId } });
    if (!deletedUser) {
      throw new UserError('User not found.', 404);
    }

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
