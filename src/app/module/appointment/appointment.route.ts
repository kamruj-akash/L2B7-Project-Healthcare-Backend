import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { AppointmentController } from "./appointment.controller";

const router = Router();

router.post(
	"/booking",
	auth(Role.PATIENT),
	AppointmentController.bookAppointment,
);
router.post("/pay", auth(Role.PATIENT), AppointmentController.payAppointment);
router.get("/callback/bkash", AppointmentController.bkashCallback);
router.post(
	"/cancel",
	auth(Role.PATIENT),
	AppointmentController.cancelAppointment,
);

router.patch(
	"/update",
	auth(Role.DOCTOR),
	AppointmentController.updateAppointment,
);

router.get(
	"/my-appointments",
	auth(Role.PATIENT),
	AppointmentController.getMyAppointments,
);

router.get(
	"/doctor-appointments",
	auth(Role.DOCTOR),
	AppointmentController.getDoctorAppointments,
);

router.get(
	"/single-appointment/:id",
	auth(Role.PATIENT, Role.DOCTOR),
	AppointmentController.getSingleAppointments,
);

router.get(
	"/all-appointments",
	auth(Role.ADMIN),
	AppointmentController.getAllAppointments,
);

export const AppointmentRoutes = router;
