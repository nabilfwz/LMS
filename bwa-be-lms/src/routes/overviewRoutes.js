import e from "express";
import {verifyToken} from "../middlewares/verifyToken.js"
import { getOverviews } from "../controllers/overviewController.js";

const overviewRoutes=e.Router()

overviewRoutes.get('/overviews',verifyToken,getOverviews)

export default overviewRoutes