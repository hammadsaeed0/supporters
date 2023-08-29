import mongoose from "mongoose";

const Schema = mongoose.Schema;


const userSchema = new Schema({
  profileImage: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    required: true,
  },
  experienceYears: {
    type: Number,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    require: true
  },
  chatSessionPrice: {
    type: Number,
    required: true,
  },
  audioCallSessionPrice: {
    type: Number,
    required: true,
  },
  videoCallSessionPrice: {
    type: Number,
    required: true,
  },
});

export const User = mongoose.model("Doctor", userSchema);
