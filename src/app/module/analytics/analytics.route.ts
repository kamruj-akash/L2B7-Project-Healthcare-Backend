import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { analyticsController } from "./analytics.controller";

const router = Router();

router.get(
	"/admin-analytics",
	auth(Role.ADMIN, Role.SUPER_ADMIN),
	analyticsController.adminAnalytics,
);
router.get(
	"/doctor-analytics",
	auth(Role.DOCTOR),
	analyticsController.doctorAnalytics,
);
router.get(
	"/patient-analytics",
	auth(Role.PATIENT),
	analyticsController.patientAnalytics,
);

export const AnalyticsRoutes = router;
