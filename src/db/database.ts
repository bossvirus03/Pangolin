import { Sequelize } from "sequelize-typescript";

const sequelize = new Sequelize({
  logging: false,
  dialect: "sqlite",
  storage: "./src/db/data/database.sqlite",
});
export default sequelize;
