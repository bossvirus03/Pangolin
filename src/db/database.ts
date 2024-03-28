import { Sequelize } from "sequelize-typescript";
import { User } from "./models/userModel";
import { Thread } from "./models/threadModel";
import { UserInThread } from "./models/userInThreadModel";

const sequelize = new Sequelize({
  logging: false,
  dialect: "sqlite",
  storage: "./src/database/data/database.sqlite",
});

// Thêm các model vào Sequelize instance
sequelize.addModels([User, Thread, UserInThread]);
export default sequelize;
