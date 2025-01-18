import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/db';
import IUser from '../interfaces/user-interface';

interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'subscriber' | 'guest';
  plan: 'free' | 'premium' | 'vip' | 'exclusive';
  createdAt: Date;
}

type UserCreationAttributes = Omit<UserAttributes, 'id' | 'createdAt'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements IUser {
  declare id: string;
  declare username: string;
  declare email: string;
  declare password: string;
  declare role: 'user' | 'admin' | 'subscriber' | 'guest';
  declare plan: 'free' | 'premium' | 'vip' | 'exclusive';
  declare createdAt: Date;

  async updateUsername(newUsername: string): Promise<this> {
    this.username = newUsername;
    await this.save();
    return this;
  }

  async updatePassword(newPassword: string): Promise<this> {
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};:'",.<>/?\\|`~]).{8,}$/.test(newPassword)) {
      throw new Error(
        'Password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character'
      );
    }
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
    this.password = await bcrypt.hash(newPassword, saltRounds);
    await this.save();
    return this;
  }

  async updateEmail(newEmail: string): Promise<this> {
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(newEmail)) {
      throw new Error('Invalid email format');
    }
    this.email = newEmail;
    await this.save();
    return this;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-z][a-z0-9]*$/i,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100],
        is: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};:'",.<>/?\\|`~]).{8,}$/,
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'subscriber', 'guest'),
      defaultValue: 'user',
    },
    plan: {
      type: DataTypes.ENUM('free', 'premium', 'vip', 'exclusive'),
      defaultValue: 'free',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
    hooks: {
        beforeSave: async (user: User) => {
          if (user.changed('password')) {
            console.log('🔑 Plaintext Password (before hashing):', user.password);
            const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);
            console.log('🔒 Hashed Password (before saving):', hashedPassword);
            user.password = hashedPassword;
          }
        }
    },
  }
);

export default User;