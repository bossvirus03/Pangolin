import { Sequelize } from "sequelize-typescript";
import { UserInThread } from "./models/userInThreadModel";
import { Thread } from "./models/threadModel";
import { User } from "./models/userModel";

const sequelize = new Sequelize({
  logging: false,
  dialect: "sqlite",
  storage: "./src/db/data/database.sqlite",
});
sequelize.addModels([UserInThread, Thread, User]);
sequelize.sync();
export default sequelize;
