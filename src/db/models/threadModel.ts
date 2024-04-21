import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table
export class Thread extends Model<Thread> {
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  name?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  prefix?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  rankup?: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  resend?: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
  })
  tid!: string;
}
