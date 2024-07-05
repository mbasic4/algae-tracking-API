import { Model, DataTypes, Optional } from 'sequelize';
import Sequelize from '../config';

interface ObservationAttributes {
  id: number;
  waterColor: string;
  secchiDepth: number;
  phosphorusConcentration: number;
  citizenScientistId: number;
  bodyOfWaterId: number;
  locationId: number;
  observationRequestId: number
}

interface ObservationCreationAttributes extends Optional<ObservationAttributes, 'id' | 'observationRequestId'>  {}

interface ObservationInstance extends Model<ObservationAttributes, ObservationCreationAttributes>, ObservationAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const Observation = Sequelize.define<ObservationInstance>('observations', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  waterColor: {
    type: DataTypes.STRING(256),
    allowNull: true
  },
  secchiDepth: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  phosphorusConcentration: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  citizenScientistId: {
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
  observationRequestId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
});

export default Observation;
