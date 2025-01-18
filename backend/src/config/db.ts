import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.DB_CONNECT || '', {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});


export const connectDb = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('\x1b[32mPostgreSQL connected successfully\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mFailed to connect to PostgreSQL:\x1b[0m', error);
    process.exit(1);
  }
};
