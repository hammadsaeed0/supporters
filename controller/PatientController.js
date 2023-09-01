import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Patient } from "../model/Patient.js";
import { User } from "../model/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { Appointment } from "../model/Appointment.js";
import { CustomCheckup } from "../model/CheckUp.js";

cloudinary.v2.config({
  cloud_name: "ddu4sybue",
  api_key: "658491673268817",
  api_secret: "w35Ei6uCvbOcaN4moWBKL3BmW4Q",
});

// Register Patient
export const RegisterPatient = catchAsyncError(async (req, res, next) => {
  const { name, email, password, gender } = req.body;
  // Check if user with the same email already exists
  const existingPatient = await Patient.findOne({ email });
  if (existingPatient) {
    return next(new ErrorHandler("This Email already exists", 409));
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newPatient = await Patient.create({
    name,
    email,
    password: hashedPassword,
    gender,
  });

  res.status(201).json({
    success: true,
    message: "Patient registered successfully",
    data: newPatient,
  });
});

// // Login Patient
export const LoginPatient = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const patient = await Patient.findOne({ email });
  if (!patient) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }
  const isPasswordValid = await bcrypt.compare(password, patient.password);
  if (!isPasswordValid) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }
  res.status(201).json({ success: true, message: "Login successful", patient });
});

// Send Email
export const sendEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existingUser = await Patient.findOne({ email });
    if (!existingUser) {
      return next(new ErrorHandler("Patient Not Found", 409));
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    existingUser.otp = verificationCode;
    await existingUser.save();

    const transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.gmail.com",
      secure: true,
      auth: {
        user: "hammaddeveloper189@gmail.com",
        pass: "vvleopeoptowobxn",
      },
      secure: true,
    });

    const mailData = {
      from: '"Supporters" <hammaddeveloper189@gmail.com>',
      to: email,
      subject: "One Time OTP",
      text: "Forget Password",
      html: ` <!DOCTYPE html>
      <html>
      <head>
          <title>Password Reset</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
              }
    
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              }
    
              h2 {
                  color: #0056b3;
              }
    
              p {
                  color: #777777;
              }
    
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #007bff;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 4px;
              }
    
              .otp {
                  font-size: 24px;
                  color: #333333;
                  margin: 20px 0;
              }
    
              .footer {
                  margin-top: 20px;
                  text-align: center;
                  color: #999999;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Password Reset</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password. Your One-Time Password (OTP) is:</p>
              <div class="otp">${verificationCode}</div>
              <p>Please use this OTP to reset your password. If you did not request this reset, please ignore this email.</p>
              <p>Best regards,</p>
              <p>The Supportes Developer Team</p>
          </div>
          <div class="footer">
              <p>This email was sent to you as part of our security measures.</p>
              <p>&copy; 2023 Supportes. All rights reserved.</p>
          </div>
      </body>
      </html>
    `,
    };

    const info = await transporter.sendMail(mailData);

    res.status(200).json({
      success: true,
      message: "Mail sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

// Very And Change Password API
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    const user = await Patient.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("Patient Not Found", 404));
    }

    if (user.otp !== otp) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

    // Update the user's password to the hashed new password
    user.password = hashedPassword;

    // Clear the stored OTP since it has been used
    user.otp = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

// Show All Doctors
export const showAllDoctors = async (req, res, next) => {
  const doctors = await User.find(); // Assuming you have a Doctor model

  res.status(200).json({
    success: true,
    count: doctors.length,
    doctors,
  });
};

// Fetch and display a single doctor's profile by ID
export const getDoctorProfile = catchAsyncError(async (req, res, next) => {
  const doctorId = req.params.id; // Assuming you're passing the doctor's ID in the URL parameter
  const doctor = await User.findById(doctorId); // Assuming you have a Doctor model and MongoDB/Mongoose

  if (!doctor) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  res.status(200).json({
    success: true,
    doctor,
  });
});

// Book Appointment
export const appointmentBook = catchAsyncError(async (req, res, next) => {
  const { patientId, doctorId, sessionType, numberOfSessions, category } =
    req.body;
  // Check if the patient and doctor IDs are valid
  if (!patientId || !doctorId) {
    return next(new ErrorHandler("Patient and doctor IDs are required.", 400));
  }
  // Create a new appointment
  const appointment = new Appointment({
    patient: patientId,
    doctor: doctorId,
    sessionType,
    numberOfSessions,
    category,
  });

  // Save the appointment to the database
  await appointment.save();

  res
    .status(201)
    .json({ message: "Appointment booked successfully.", appointment });
});

// Show All Appointment
export const showAllAppointments = async (req, res, next) => {
  try {
    const id = req.params.id; // Assuming you're passing the doctor's ID in the URL parameter
    const appointments = await Appointment.find({
      patient: id,
    }).populate("doctor");
    console.log(appointments);
    console.log(id);
    res.status(200).json({ success: true, appointments });
  } catch (error) {
    next(error);
  }
};

// Show Single Appointment
export const showSingleAppointments = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId)
      .populate("doctor", "firstName lastName specialty") // Populate doctor details
      .populate("patient", "name"); // Populate patient details

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    return res.status(200).json({ success: true, appointment });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Create Custom Checkup
export const createCustomCheckup = async (req, res, next) => {
  try {
    const {
      patient,
      description,
      preferredSpecialties,
      numberOfSessions,
      totalPrice,
    } = req.body;

    // Create a new custom checkup request
    const customCheckup = new CustomCheckup({
      patient,
      description,
      preferredSpecialties,
      numberOfSessions,
      totalPrice,
    });

    // Save the custom checkup request to the database
    const savedCustomCheckup = await customCheckup.save();

    res.status(201).json({
      success: true,
      message: "Custom checkup request created successfully",
      customCheckup: savedCustomCheckup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the custom checkup request",
      error: error.message,
    });
  }
};

