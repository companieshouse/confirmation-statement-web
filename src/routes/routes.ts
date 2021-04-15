import {Router} from "express";
import * as indexRoute from "../controllers/index.controller";


export const router: Router = Router();

router.get("/", indexRoute.get);
