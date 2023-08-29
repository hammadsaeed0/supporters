import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../model/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";
import bcrypt from "bcryptjs";
import { CustomCheckup } from "../model/CheckUp.js";
import { Appointment } from "../model/Appointment.js";

cloudinary.v2.config({
  cloud_name: "ddu4sybue",
  api_key: "658491673268817",
  api_secret: "w35Ei6uCvbOcaN4moWBKL3BmW4Q",
});

// Register Doctor
export const RegisterDoctor = catchAsyncError(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    specialty,
    experienceYears,
    contactNumber,
    location,
    availability,
    gender,
    chatSessionPrice,
    audioCallSessionPrice,
    videoCallSessionPrice,
  } = req.body;
  // Check if user with the same email already exists
  const existingDoctor = await User.findOne({ email });
  if (existingDoctor) {
    return next(new ErrorHandler("This Email already exists", 409));
  }

  if (existingDoctor) {
    return next(new ErrorHandler("This Phone already exists", 409));
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newDoctor = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    specialty,
    experienceYears,
    contactNumber,
    location,
    availability,
    gender,
    chatSessionPrice,
    audioCallSessionPrice,
    videoCallSessionPrice,
  });

  res.status(201).json({
    success: true,
    message: "Doctor registered successfully",
    data: newDoctor,
  });
});

// Login Doctor
export const LoginDoctor = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const doctor = await User.findOne({ email });
  if (!doctor) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }
  const isPasswordValid = await bcrypt.compare(password, doctor.password);
  if (!isPasswordValid) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }
  res.status(201).json({ success: true, message: "Login successful", doctor });
});

// Show All Custom CheckUp Request
export const showAllCustomCheckUp = catchAsyncError(async (req, res, next) => {
  try {
    const customCheckups = await CustomCheckup.find()
      .populate("patient", "firstName lastName")
      .populate("selectedDoctor", "firstName lastName");
    res
      .status(200)
      .json({ success: true, count: customCheckups.length, customCheckups });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Show Single Custom CheckUp Request
export const showSingleCustomCheckUp = catchAsyncError(
  async (req, res, next) => {
    try {
      const customCheckup = await CustomCheckup.findById(req.params.id)
        .populate("patient", "firstName lastName")
        .populate("selectedDoctor", "firstName lastName");
      if (!customCheckup) {
        return res
          .status(404)
          .json({ success: false, error: "Custom checkup not found" });
      }
      res.status(200).json({ success: true, customCheckup });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Send Invite on Custom CheckUp
export const sendInvite = catchAsyncError(async (req, res, next) => {
  try {
    const customCheckup = await CustomCheckup.findById(req.params.id);
    if (!customCheckup) {
      return res
        .status(404)
        .json({ success: false, error: "Custom checkup not found" });
    }

    if (customCheckup.status !== "Open") {
      return res.status(400).json({
        success: false,
        error: "Custom checkup is not open for invites",
      });
    }

    // Assuming the doctor's ID is available in req.user.id after authentication
    const doctorId = req.body.doctorId; // Check this line

    // Update custom checkup status to "Assigned"
    customCheckup.status = "Assigned";
    customCheckup.selectedDoctor = doctorId;
    await customCheckup.save();

    // Create an appointment between the patient and the doctor
    const appointment = new Appointment({
      patient: customCheckup.patient,
      doctor: doctorId,
      sessionType: "audioCall",
      numberOfSessions: customCheckup.numberOfSessions,
      totalPrice: customCheckup.totalPrice,
    });
    await appointment.save();

    res
      .status(200)
      .json({ success: true, message: "Invite sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Controller function to get all appointments for the current doctor
export const getDoctorAppointments = catchAsyncError(async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient')
      .exec();

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
