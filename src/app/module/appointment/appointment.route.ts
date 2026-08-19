import { Router } from "express";
import { AppointmentController } from "./appointment.controller";

const router = Router();

router.post("/booking", AppointmentController.bookAppointment);
router.get("/callback/bkash", AppointmentController.bkashCallback);

export const AppointmentRoutes = router;
