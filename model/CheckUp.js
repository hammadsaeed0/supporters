import mongoose from "mongoose";


const customCheckupSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient', // Reference to the Patient model
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  preferredSpecialties: {
    type: [String], // Array of doctor specialties preferred by the patient
  },
  status: {
    type: String,
    enum: ['Open', 'Assigned', 'Completed'],
    default: 'Open',
  },
  selectedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor', // Reference to the Doctor model
  },
  numberOfSessions: {
    type: Number,
  },
  totalPrice: {
    type: Number,
  }
});


export const CustomCheckup = mongoose.model("CustomCheckup", customCheckupSchema);
