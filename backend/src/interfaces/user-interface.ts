export default interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'subscriber' | 'guest';
  plan: 'free' | 'premium' | 'vip' | 'exclusive';
  createdAt: Date;

  updateUsername(newUsername: string): Promise<this>;
  updatePassword(newPassword: string): Promise<this>;
  updateEmail(newEmail: string): Promise<this>;
}