const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const express = require("express");
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
const uri = "mongodb://127.0.0.1:27017/dblogin";
const client = new MongoClient(uri);

let db;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db();
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}

async function initializeDb() {
  await connectToDatabase();
}

initializeDb();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/register", async (req, res) => {
  console.log("POST /register");

  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      email,
      username,
      password: hashedPassword,
    };

    const results = await db.collection("auth").insertOne(data);

    res.status(201).json({ message: "User registered successfully", userId: results.insertedId });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Error during registration" });
  }
});






app.post("/login", async (req, res) => {
  console.log("POST /login");

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await db.collection("auth").findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful", userId: user._id });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Error during login" });
  }
});


const port = 3000;
app.listen(port, () => {
  console.log("Server running on http://localhost:${port}");
});