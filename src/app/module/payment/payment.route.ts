import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { paymentController } from "./payment.controller";

const router = Router();

router.get("/my-payments", auth(Role.PATIENT), paymentController.getMyPayments);
router.get(
	"/all-payments",
	auth(Role.ADMIN, Role.SUPER_ADMIN),
	paymentController.getAllPayments,
);
router.get(
	"/single-payment/:id",
	auth(Role.ADMIN, Role.SUPER_ADMIN, Role.PATIENT),
	paymentController.getSinglePayments,
);

export const PaymentRoute = router;
