import { Model, Optional, DataTypes } from 'sequelize';
import Sequelize from '../config';

interface LocationAttributes {
  id: number;
  location: string;
}

interface LocationCreationAttributes extends Optional<LocationAttributes, 'id'>  {}

interface LocationInstance extends Model<LocationAttributes, LocationCreationAttributes>, LocationAttributes {}

const Location = Sequelize.define<LocationInstance>('locations', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  location: {
    type: DataTypes.GEOGRAPHY('POINT', 4326),
    allowNull: false
  }
},
{
  timestamps: false
});

export default Location;
