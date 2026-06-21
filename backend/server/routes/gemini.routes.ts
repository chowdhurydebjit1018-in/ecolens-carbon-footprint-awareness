import { Router } from "express";
import { getInsights, getChat } from "../controllers/gemini.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.post("/insights", authenticate, getInsights);
router.post("/chat", authenticate, getChat);

export default router;
