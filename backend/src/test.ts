import bcrypt from 'bcrypt';

(async () => {
  const password = 'Den220612!';
  const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
  console.log('📝 Plain Password:', password);

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('🔒 Hashed Password:', hashedPassword);
})();