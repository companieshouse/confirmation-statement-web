import express from "express";
import * as path from "path";
import { router } from "./routes/routes";

const app = express();

app.enable("trust proxy");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// apply our default router to /
app.use("/confirmation-statement", router);

export default app;
