import { Router } from "express";
import { logActivity, getActivitiesHandler, deleteActivityHandler } from "../controllers/activities.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.post("/", authenticate, logActivity);
router.get("/", authenticate, getActivitiesHandler);
router.delete("/:id", authenticate, deleteActivityHandler);

export default router;
