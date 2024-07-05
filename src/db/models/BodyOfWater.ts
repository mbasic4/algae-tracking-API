import { Model, DataTypes } from 'sequelize';
import Sequelize from '../config';

interface BodyOfWaterAttributes {
  id: number;
  name: string;
  geom: string;
}

interface BodyOfWaterInstance extends Model<BodyOfWaterAttributes>, BodyOfWaterAttributes {}

const BodyOfWater = Sequelize.define<BodyOfWaterInstance>('bodies_of_water', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150)
  },
  geom: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON')
  }
}, {
  timestamps: false,
  freezeTableName: true
})

export default BodyOfWater
