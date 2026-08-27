require("dotenv").config();
const { connectDB } = require("./db");

const OWNER_EMAIL = "PUT_YOUR_LOGIN_EMAIL_HERE"; // the email you registered/logged in with

const rooms = [
  {
    name: "The Reading Nook",
    description: "A cozy, sunlit corner room lined with bookshelves — ideal for solo deep-focus sessions with minimal distraction.",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80",
    floor: "2nd Floor",
    capacity: 2,
    hourlyRate: 4,
    amenities: ["Wi-Fi", "Quiet Zone", "Power Outlets"],
  },
  {
    name: "Collaboration Hub",
    description: "An open, bright space with a large whiteboard wall — built for group projects, brainstorms, and study circles.",
    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80",
    floor: "1st Floor",
    capacity: 8,
    hourlyRate: 10,
    amenities: ["Whiteboard", "Projector", "Wi-Fi", "Power Outlets"],
  },
  {
    name: "Silent Study Pod",
    description: "A compact, soundproofed single pod for exam prep and focused reading, tucked away from foot traffic.",
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
    floor: "3rd Floor",
    capacity: 1,
    hourlyRate: 3,
    amenities: ["Quiet Zone", "Power Outlets", "Air Conditioning"],
  },
  {
    name: "The Glass Room",
    description: "A modern glass-walled meeting room with natural light on all sides — great for presentations and small team sessions.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    floor: "4th Floor",
    capacity: 6,
    hourlyRate: 8,
    amenities: ["Projector", "Wi-Fi", "Air Conditioning"],
  },
  {
    name: "Corner Focus Room",
    description: "A quiet two-person room with a large desk and warm lighting, perfect for pair studying or tutoring sessions.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    floor: "2nd Floor",
    capacity: 2,
    hourlyRate: 5,
    amenities: ["Whiteboard", "Wi-Fi", "Power Outlets", "Quiet Zone"],
  },
  {
    name: "The Loft",
    description: "A spacious upper-level room with skylights and lounge-style seating — a relaxed spot for longer study sessions.",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
    floor: "5th Floor",
    capacity: 5,
    hourlyRate: 7,
    amenities: ["Wi-Fi", "Air Conditioning", "Power Outlets"],
  },
];

async function seed() {
  const db = await connectDB();

  const user = await db.collection("user").findOne({ email: OWNER_EMAIL });
  if (!user) {
    console.error(`No user found with email ${OWNER_EMAIL}. Log in once on the live site with this email first, then rerun.`);
    process.exit(1);
  }

  const docs = rooms.map((r) => ({
    ...r,
    ownerId: user.id,
    ownerName: user.name,
    bookingCount: 0,
    createdAt: new Date(),
  }));

  const result = await db.collection("rooms").insertMany(docs);
  console.log(`Inserted ${result.insertedCount} rooms.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});