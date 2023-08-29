import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient", // Reference to the Patient model
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor", // Reference to the Doctor model
  },
  sessionType: {
    type: String,
    enum: ["chat", "audioCall", "videoCall"],
  },
  numberOfSessions: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["Active", "Closed"],
    default: "Active",
  },
  category: {
    type: String,
  },
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);
