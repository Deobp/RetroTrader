import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import ITimeframe from '../interfaces/timeframe-interface';
import Candle from './candle-model';


interface TimeframeAttributes extends ITimeframe {}
interface TimeframeCreationAttributes extends Optional<TimeframeAttributes, 'id'> {}

class Timeframe extends Model<TimeframeAttributes, TimeframeCreationAttributes> implements TimeframeAttributes {
  public id!: number;
  public name!: string;
}

Timeframe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'timeframes',
    modelName: 'Timeframe',
    timestamps: false,
  }
);

Timeframe.hasMany(Candle, { foreignKey: 'timeframe_id', as: 'candles' });
Candle.belongsTo(Timeframe, { foreignKey: 'timeframe_id', as: 'timeframe' });

export default Timeframe;
