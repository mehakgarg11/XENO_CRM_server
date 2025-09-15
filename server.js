
// This MUST be the first line
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

// --- All Your Route Imports ---
const authRouter = require('./routes/authRoutes');
const customerRouter = require("./routes/customerRoutes");
const orderRouter = require("./routes/orderRoutes");
const campaignRouter = require("./routes/campaignRoutes");
const vendorRouter = require("./routes/vendorRoutes");
const analyticsRouter = require("./routes/analyticsRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const aiRoutes = require("./routes/aiRoutes");

require('./config/passport');
const app = express();

// --- Middlewares ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// --- Session Middleware for Passport (Required for Google Login) ---
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// --- MongoDB Connection ---
mongoose
 .connect(process.env.MONGO_URI)
 .then(() => console.log("DB is Connected Successfully!"))
 .catch((err) => console.log("DB Error:", err.message));

// --- Routes (Set to your original paths) ---
app.use("/api/auth", authRouter);
app.use("/api/ai", aiRoutes);

app.use("/customers", customerRouter);
app.use("/orders", orderRouter);
app.use("/campaigns", campaignRouter);
app.use("/vendor", vendorRouter);
app.use("/analytics", analyticsRouter);
app.use("/webhooks", webhookRoutes);

// --- Default and Health Routes ---
app.get("/api/health", (_, res) => res.json({ ok: true }));
app.get("/", (req, res) => {
    res.send("Welcome to Xeno Backend Server");
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Listening at port ${PORT}`);
});