const express = require("express");
const cors = require("cors");
const { connectDB } = require("../db");
const { createAuth } = require("../auth");
const roomsRouter = require("../routes/rooms");
const bookingsRouter = require("../routes/bookings");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

let readyPromise;

async function getReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      const { toNodeHandler } = await import("better-auth/node");
      const db = await connectDB();
      const auth = await createAuth(db);   // ← added await
      return { toNodeHandler, auth };
    })();
  }
  return readyPromise;
}

app.all("/api/auth/*splat", async (req, res) => {
  const { toNodeHandler, auth } = await getReady();
  return toNodeHandler(auth)(req, res);
});

app.use(express.json());

app.use(async (req, res, next) => {
  const { auth } = await getReady();
  req.auth = auth;
  next();
});

app.get("/", (req, res) => res.send("studyNook-server is running"));
app.use("/api/rooms", roomsRouter);
app.use("/api/bookings", bookingsRouter);

module.exports = app;