const express = require("express");
const { ObjectId } = require("mongodb");
const { collections } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/rooms?search=&amenities=&latest=6
router.get("/", async (req, res) => {
  try {
    const { search, amenities, latest, minRate, maxRate, floor } = req.query;
    const query = {};

    if (search) query.name = { $regex: search, $options: "i" };
    if (amenities) query.amenities = { $in: amenities.split(",") };
    if (floor) query.floor = floor;
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }

    let cursor = collections.rooms().find(query).sort({ createdAt: -1 });
    if (latest) cursor = cursor.limit(Number(latest));

    const rooms = await cursor.toArray();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

// GET /api/rooms/:id
router.get("/:id", async (req, res) => {
  try {
    const room = await collections.rooms().findOne({ _id: new ObjectId(req.params.id) });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: "Invalid room id" });
  }
});

// POST /api/rooms
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, description, image, floor, capacity, hourlyRate, amenities } = req.body;

    if (!name || !description || !image || !floor || !capacity || !hourlyRate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const room = {
      name,
      description,
      image,
      floor,
      capacity: Number(capacity),
      hourlyRate: Number(hourlyRate),
      amenities: Array.isArray(amenities) ? amenities : [],
      ownerId: req.user.id,
      ownerName: req.user.name,
      bookingCount: 0,
      createdAt: new Date(),
    };

    const result = await collections.rooms().insertOne(room);
    res.status(201).json({ ...room, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: "Failed to create room" });
  }
});

// PUT /api/rooms/:id  (owner only)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const room = await collections.rooms().findOne({ _id: new ObjectId(req.params.id) });
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.ownerId !== req.user.id) {
      return res.status(403).json({ message: "You don't own this room" });
    }

    const { name, description, image, floor, capacity, hourlyRate, amenities } = req.body;
    const update = {
      ...(name && { name }),
      ...(description && { description }),
      ...(image && { image }),
      ...(floor && { floor }),
      ...(capacity && { capacity: Number(capacity) }),
      ...(hourlyRate && { hourlyRate: Number(hourlyRate) }),
      ...(amenities && { amenities }),
    };

    await collections.rooms().updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    res.json({ message: "Room updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update room" });
  }
});

// DELETE /api/rooms/:id  (owner only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const room = await collections.rooms().findOne({ _id: new ObjectId(req.params.id) });
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.ownerId !== req.user.id) {
      return res.status(403).json({ message: "You don't own this room" });
    }

    await collections.rooms().deleteOne({ _id: new ObjectId(req.params.id) });
    await collections.bookings().deleteMany({ roomId: req.params.id });

    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete room" });
  }
});

// GET /api/rooms/mine/list  (current user's rooms)
router.get("/mine/list", requireAuth, async (req, res) => {
  try {
    const rooms = await collections.rooms().find({ ownerId: req.user.id }).toArray();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your rooms" });
  }
});

module.exports = router;