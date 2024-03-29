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
}
