import { Model, DataTypes, Optional } from 'sequelize';
import Sequelize from '../config';

interface ObservationRequestAttributes {
  id: number;
  biologistId: number;
  bodyOfWaterId: number;
  locationId: number;
}

interface ObservationRequestCreationAttributes extends Optional<ObservationRequestAttributes, 'id'>  {}

interface ObservationRequestInstance extends Model<ObservationRequestAttributes, ObservationRequestCreationAttributes>, ObservationRequestAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const ObservationRequest = Sequelize.define<ObservationRequestInstance>('observation_requests', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  biologistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bodyOfWaterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  locationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default ObservationRequest;
