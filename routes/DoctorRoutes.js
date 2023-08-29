import express from "express";
import { RegisterDoctor , LoginDoctor, showAllCustomCheckUp, showSingleCustomCheckUp, sendInvite, getDoctorAppointments } from "../controller/DoctorController.js";
import { showSingleAppointments } from "../controller/PatientController.js";

const router = express.Router();

router.route("/RegisterDoctor").post(RegisterDoctor)
router.route("/LoginDoctor").get(LoginDoctor)
router.route("/showAllCustomCheckUp").post(showAllCustomCheckUp)
router.route("/showSingleCustomCheckUp/:id").post(showSingleCustomCheckUp)
router.route("/sendInvite/:id").post(sendInvite)
router.route("/getDoctorAppointments/:id").post(getDoctorAppointments)


export default router;
