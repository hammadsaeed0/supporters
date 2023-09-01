import mongoose from "mongoose";

const Schema = mongoose.Schema;


const patientSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profileImage: {
    public_id: String,
    url: String,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  otp:{
    type: String,
    default: null
  }
});

export const Patient = mongoose.model("Patient", patientSchema);
