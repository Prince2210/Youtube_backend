import dotenv from "dotenv";
import dbConnect from "./src/db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});
dbConnect()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });


