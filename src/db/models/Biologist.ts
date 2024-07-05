import { Model, DataTypes, Optional } from 'sequelize';
import Sequelize from '../config';

interface BiologistAttributes {
  id: number;
  userId: number;
}

interface BiologistCreationAttributes extends Optional<BiologistAttributes, 'id'>  {}

interface BiologistInstance extends Model<BiologistAttributes, BiologistCreationAttributes>, BiologistAttributes {}

const Biologist = Sequelize.define<BiologistInstance>('biologists', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
},
{
  timestamps: false,
});

export default Biologist;
