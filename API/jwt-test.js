import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // load .env

console.log("JWT_SECRET is:", process.env.JWT_SECRET);

// Dummy user for testing
const user = { id: 123 };

// 1️⃣ Sign a token
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
console.log("Signed token:", token);

// 2️⃣ Immediately verify it
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("Decoded token:", decoded);
} catch (err) {
  console.error("JWT verification failed:", err);
}
