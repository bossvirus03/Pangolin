import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table
export class UserInThread extends Model<UserInThread> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  uid!: string;

  @Column({
    unique: true,
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
  })
  uniqueId!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: true,
  })
  exp?: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  tid!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: true,
  })
  countMessageOfDay: number;

  @Column({
    type: DataType.DATE,
    defaultValue: new Date(),
    allowNull: true,
  })
  lastDayUpdate: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: true,
  })
  countMessageOfWeek: number;

  @Column({
    type: DataType.DATE,
    defaultValue: new Date(),
    allowNull: true,
  })
  lastWeekUpdate: Date;
}
