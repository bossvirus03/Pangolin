import {
  Table,
  Column,
  Model,
  DataType,
  AutoIncrement,
} from "sequelize-typescript";

@Table
export class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
  })
  uid!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: false,
  })
  name?: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  exp!: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  money!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  prefix!: string;
}
