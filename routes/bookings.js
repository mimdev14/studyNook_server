const express = require("express");
const { ObjectId } = require("mongodb");
const { collections } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/bookings  (create booking, with conflict check)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { roomId, date, startTime, endTime, note } = req.body;

    if (!roomId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    const startHour = Number(startTime.split(":")[0]);
    const endHour = Number(endTime.split(":")[0]);
    if (endHour <= startHour) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    const room = await collections.rooms().findOne({ _id: new ObjectId(roomId) });
    if (!room) return res.status(404).json({ message: "Room not found" });

    // conflict check: same room, same date, confirmed, overlapping time range
    const conflict = await collections.bookings().findOne({
      roomId,
      date,
      status: "confirmed",
      startHour: { $lt: endHour },
      endHour: { $gt: startHour },
    });

    if (conflict) {
      return res.status(409).json({ message: "This time slot is already booked" });
    }

    const totalCost = (endHour - startHour) * room.hourlyRate;

    const booking = {
      roomId,
      roomName: room.name,
      roomImage: room.image,
      userId: req.user.id,
      date,
      startTime,
      endTime,
      startHour,
      endHour,
      totalCost,
      note: note || "",
      status: "confirmed",
      createdAt: new Date(),
    };

    const result = await collections.bookings().insertOne(booking);

    await collections.rooms().updateOne(
      { _id: new ObjectId(roomId) },
      { $inc: { bookingCount: 1 }, $push: { bookingIds: result.insertedId } }
    );
    await collections.users().updateOne(
      { id: req.user.id },
      { $push: { bookings: result.insertedId } },
      { upsert: true }
    );

    res.status(201).json({ ...booking, _id: result.insertedId });
  } catch (err) {
    console.error("POST /api/bookings failed:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

// GET /api/bookings/mine
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const bookings = await collections.bookings()
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(bookings);
  } catch (err) {
    console.error("GET /api/bookings/mine failed:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// PATCH /api/bookings/:id/cancel
router.patch("/:id/cancel", requireAuth, async (req, res) => {
  try {
    const booking = await collections.bookings().findOne({ _id: new ObjectId(req.params.id) });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: "This booking doesn't belong to you" });
    }

    await collections.bookings().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: "cancelled" } }
    );

    await collections.users().updateOne(
      { id: req.user.id },
      { $pull: { bookings: new ObjectId(req.params.id) } }
    );

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    console.error("PATCH /api/bookings/:id/cancel failed:", err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});

module.exports = router;