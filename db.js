const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is missing in .env");

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let db;

async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db(process.env.MONGODB_DB || "studynook");
  console.log("Connected to MongoDB Atlas");
  return db;
}

function getDB() {
  if (!db) throw new Error("Database not initialized. Call connectDB() first.");
  return db;
}

const collections = {
  rooms: () => getDB().collection("rooms"),
  bookings: () => getDB().collection("bookings"),
  users: () => getDB().collection("users"),
};

module.exports = { connectDB, getDB, collections, client };