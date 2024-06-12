const express = require("express");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const CryptoJS = require("crypto-js");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const dbPath = path.resolve(__dirname, "passwords.db");
const db = new sqlite3.Database(dbPath);

app.use(bodyParser.json());

// Initialize the database
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS passwords (id INTEGER PRIMARY KEY, user_id INTEGER, site TEXT, username TEXT, password TEXT)"
  );
});

// Helper function to encrypt passwords
function encryptPassword(password) {
  return CryptoJS.AES.encrypt(password, "secret key").toString();
}

// Helper function to decrypt passwords
function decryptPassword(encryptedPassword) {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, "secret key");
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Register endpoint
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    function (err) {
      if (err) {
        return res.status(500).send("Error registering user");
      }
      res.status(200).send("User registered");
    }
  );
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, row) => {
      if (err || !row || !(await bcrypt.compare(password, row.password))) {
        alert("Invalid credentials");
        return res.status(400).send("Invalid credentials");
      }
      res.status(200).send("User authenticated");
    }
  );
});

// Store password endpoint
app.post("/store-password", (req, res) => {
  const { user_id, site, username, password } = req.body;
  const encryptedPassword = encryptPassword(password);

  db.run(
    "INSERT INTO passwords (user_id, site, username, password) VALUES (?, ?, ?, ?)",
    [user_id, site, username, encryptedPassword],
    function (err) {
      if (err) {
        return res.status(500).send("Error storing password");
      }
      res.status(200).send("Password stored");
    }
  );
});

// Retrieve password endpoint
app.post("/get-password", (req, res) => {
  const { user_id, site } = req.body;

  db.all(
    "SELECT * FROM passwords WHERE user_id = ? AND (site LIKE ? OR username LIKE ?)",
    [user_id, `%${site}%`, `%${site}%`],
    function (err, rows) {
      if (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
      }

      if (rows.length === 0) {
        return res.status(404).send("Password not found");
      }

      const results = rows.map((row) => {
        const decryptedPassword = decryptPassword(row.password);
        return { username: row.username, password: decryptedPassword };
      });

      res.status(200).send(results);
    }
  );
});

app.listen(3000, () => {
  console.log("Password Manager Server running on port 3000...");
  console.log(
    "Do not close. Unless you wanna turn off the password manager extension"
  );
  console.log("To shutdown the server. Hit ctrl + C");
});
