import { Request, Response, NextFunction } from "express";
import { createActivity, getUserActivities, deleteActivity } from "../services/activity.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticationError } from "../utils/errors";

export const logActivity = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.uid) {
    throw new AuthenticationError("User is not authenticated");
  }

  try {
    const { date, category, activityType, quantity, notes, unit, clientRequestId } = req.body;
    const activity = await createActivity(req.user.uid, { date, category, activityType, quantity, notes, unit, clientRequestId });
    
    return sendSuccess(res, activity, { message: "Activity logged successfully" }, 201);
  } catch (error: any) {
    if (process.env.NODE_ENV === "development" && error.code === "VALIDATION_ERROR") {
      console.warn("Activity validation failed:", {
        requestId: req.id,
        code: error.code,
        message: error.message
      });
    }
    throw error;
  }
});

export const getActivitiesHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.uid) {
    throw new AuthenticationError("User is not authenticated");
  }

  const activities = await getUserActivities(req.user.uid);
  return sendSuccess(res, { activities }, { message: "Activities retrieved successfully" }, 200);
});

export const deleteActivityHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.uid) {
    throw new AuthenticationError("User is not authenticated");
  }

  const { id } = req.params;
  if (!id) {
    throw new Error("Activity ID is required");
  }

  await deleteActivity(req.user.uid, id);
  return sendSuccess(res, null, { message: "Activity deleted successfully" }, 200);
});
