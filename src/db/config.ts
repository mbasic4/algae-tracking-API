import { Sequelize } from 'sequelize';
import dotenv from 'dotenv'
dotenv.config()

const DB_NAME = process.env.DB_NAME || 'algae_tracking_db';
const DB_USER = process.env.DB_USER || 'algae_tracker';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PASSWORD = process.env.DB_PASSWORD || 'algae_tracker';
const DB_PORT = process.env.DB_PORT || '5433';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT),
  dialect: 'postgres',
  define: {
    underscored: true,
  }
});

export default sequelize;
