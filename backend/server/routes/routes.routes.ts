import { Router } from "express";
import { getEcoRoute } from "../controllers/routes.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.post("/eco", authenticate, getEcoRoute);

export default router;
