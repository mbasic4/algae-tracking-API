import { Model, DataTypes, Optional } from 'sequelize';
import Sequelize from '../config';

interface CitizenScientistAttributes {
  id: number;
  userId: number;
  locationId: number;
  address: string;
}

interface CitizenScientistCreationAttributes extends Optional<CitizenScientistAttributes, 'id'>  {}

interface CitizenScientistInstance extends Model<CitizenScientistAttributes, CitizenScientistCreationAttributes>, CitizenScientistAttributes {}

const CitizenScientist = Sequelize.define<CitizenScientistInstance>('citizen_scientists', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  locationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
{
  timestamps: false
});

export default CitizenScientist;
