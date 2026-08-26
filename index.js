const express = require("express");
const cors = require("cors");
const { toNodeHandler } = require("better-auth/node");
const { connectDB } = require("./db");
const { createAuth } = require("./auth");
const roomsRouter = require("./routes/rooms");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

connectDB().then((db) => {
  const auth = createAuth(db);

  // must be mounted BEFORE express.json()
  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json());

  app.use((req, res, next) => {
    req.auth = auth;
    next();
  });

  app.get("/", (req, res) => {
    res.send("studyNook-server is running");
  });

  app.use("/api/rooms", roomsRouter);

  app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
});