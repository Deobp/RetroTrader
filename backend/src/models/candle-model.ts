import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import ICandle from '../interfaces/candle-interface';

interface CandleAttributes extends ICandle {}
interface CandleCreationAttributes extends Optional<CandleAttributes, 'id'> {}

class Candle extends Model<CandleAttributes, CandleCreationAttributes> implements CandleAttributes {
  public id!: number;
  public symbol_id!: number;
  public timeframe_id!: number;
  public datetime!: Date;
  public open!: number;
  public high!: number;
  public low!: number;
  public close!: number;
  public volume!: number;
}

Candle.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    symbol_id: { type: DataTypes.INTEGER, allowNull: false },
    timeframe_id: { type: DataTypes.INTEGER, allowNull: false },
    datetime: { type: DataTypes.DATE, allowNull: false },
    open: { type: DataTypes.FLOAT, allowNull: false },
    high: { type: DataTypes.FLOAT, allowNull: false },
    low: { type: DataTypes.FLOAT, allowNull: false },
    close: { type: DataTypes.FLOAT, allowNull: false },
    volume: { type: DataTypes.FLOAT, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Candle',
    tableName: 'ohlc_data',
    timestamps: false,
    indexes: [
      {  fields: ['symbol_id', 'timeframe_id', 'datetime'] },
    ],
  }
);

export default Candle;
