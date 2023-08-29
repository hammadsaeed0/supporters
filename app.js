import express from "express";
import { connectDB } from "./config/database.js";
import { APP_PORT } from "./config/index.js";
import DoctorRoutes from "./routes/DoctorRoutes.js";
import PaitentRoutes from "./routes/PaitentRoutes.js"
import ErrorMiddleware from "./middleware/Error.js";
import fileupload from "express-fileupload";
import cors from 'cors';
const app = express();


connectDB();

// Use Middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  fileupload({
    useTempFiles: true,
  })
);
app.use(cors());

// Import User Routes
app.use("/v1/doctor", DoctorRoutes);
app.use("v1/patient", PaitentRoutes);

app.listen(APP_PORT, () => {
  console.log(`app  on port ${APP_PORT}`);
});

app.use(ErrorMiddleware);
