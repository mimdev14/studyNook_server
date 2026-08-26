async function requireAuth(req, res, next) {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.append(key, Array.isArray(value) ? value.join(",") : value);
    }

    const session = await req.auth.api.getSession({ headers });
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    req.user = session.user;
    next();
  } catch (err) {
    console.error("requireAuth failed:", err);   // ← add this line
    res.status(401).json({ message: "Unauthorized" });
  }
}
module.exports = { requireAuth };