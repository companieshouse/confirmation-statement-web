import express from "express";
import { serviceAvailabilityMiddleware } from "./middleware/service.availability.middleware";
import * as nunjucks from "nunjucks";
import * as path from "path";
import { router } from "./routes/routes";

const app = express();

// view engine setup
const nunjucksEnv = nunjucks.configure([
  "views",
  "node_modules/govuk-frontend/",
  "node_modules/govuk-frontend/components/",
], {
  autoescape: true,
  express: app,
});

nunjucksEnv.addGlobal("assetPath", process.env.CDN_HOST);

app.enable("trust proxy");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// apply middleware
app.use(serviceAvailabilityMiddleware);

// apply our default router to /
app.use("/confirmation-statement", router);

export default app;
