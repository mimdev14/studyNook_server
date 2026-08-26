const express = require("express");
const cors = require("cors");
const { toNodeHandler } = require("better-auth/node");
const { connectDB } = require("../db");
const { createAuth } = require("../auth");
const roomsRouter = require("../routes/rooms");
const bookingsRouter = require("../routes/bookings");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

const authPromise = connectDB().then((db) => createAuth(db));

app.all("/api/auth/*splat", async (req, res) => {
  const auth = await authPromise;
  return toNodeHandler(auth)(req, res);
});

app.use(express.json());

app.use(async (req, res, next) => {
  req.auth = await authPromise;
  next();
});

app.get("/", (req, res) => res.send("studyNook-server is running"));
app.use("/api/rooms", roomsRouter);
app.use("/api/bookings", bookingsRouter);

module.exports = app;