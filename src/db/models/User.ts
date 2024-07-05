import { Model, Optional, DataTypes } from 'sequelize';
import Sequelize from '../config';

interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'>  {}

interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const User = Sequelize.define<UserInstance>('users', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(256),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(256),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(256),
    allowNull: false,
  },
  passwordHash: {
    type: DataTypes.STRING(256),
    allowNull: false,
  }
});

export default User;

