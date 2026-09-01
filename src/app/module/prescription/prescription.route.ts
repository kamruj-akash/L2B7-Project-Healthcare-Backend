import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { prescriptionController } from "./prescription.controller";

const router = Router();

router.post(
	"/create",
	auth(Role.DOCTOR),
	prescriptionController.createPrescription,
);
router.get(
	"/:id",
	auth(Role.DOCTOR, Role.PATIENT, Role.ADMIN, Role.SUPER_ADMIN),
	prescriptionController.getSinglePrescription,
);

export const PrescriptionRoutes = router;
