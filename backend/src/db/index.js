import mongoose from "mongoose";
import { DB_NAME } from "../../constant.js";

async function dbConnect() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);
    console.log(`Database connected sucessfully`);
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
}
export default dbConnect;
