import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import {rateLimit} from "express-rate-limit";

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

//json data limit
app.use(express.json({limit:"16kb"}))

//rate-limiter
const limiter = rateLimit({
	windowsMs: 10 * 60 * 1000, //10 mins
	max: 50 // amount
})
app.use(limiter);
//url encoder
app.use(urlencoded({extended:true}));
app.use(express.static("public"));
app.use(cookieParser());

//import routes
import userRouter from "./routes/user.routes.js";
import brokerRouter from "./routes/broker.routes.js";
import bookingRouter from "./routes/booking.routes.js";

//routes declaration
app.use("/api/users",userRouter);
//broker routes
app.use("/api/brokers",brokerRouter);
//booking routes
app.use("/api/bookings",bookingRouter);
export default app;