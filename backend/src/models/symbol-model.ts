import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import ISymbol from '../interfaces/symbol-interface';
import Candle from './candle-model';

interface SymbolAttributes extends ISymbol {};
interface SymbolCreationAttributes extends Optional<SymbolAttributes, 'id'> {};

export default class Symbol extends Model<SymbolAttributes, SymbolCreationAttributes> implements SymbolAttributes {
  public id!: number;
  public name!: string;
}

Symbol.init(
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
    tableName:'symbols',
    modelName: 'Symbol',
    timestamps: false,
  }
)

Symbol.hasMany(Candle, { foreignKey: 'symbol_id', as: 'candles' });
Candle.belongsTo(Symbol, { foreignKey: 'symbol_id', as: 'symbol' });
