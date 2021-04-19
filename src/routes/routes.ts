import { Router } from "express";
import * as startRoute from "../controllers/start.controller";


export const router: Router = Router();


router.get("/", startRoute.get);
