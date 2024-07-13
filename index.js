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

const createTables = () => {
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS passwords (id INTEGER PRIMARY KEY, user_id INTEGER, site TEXT, username TEXT, password TEXT)"
    );
  });
};

const encryptPassword = (password) => {
  return CryptoJS.AES.encrypt(password, "secret key").toString();
};

const decryptPassword = (encryptedPassword) => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, "secret key");
  return bytes.toString(CryptoJS.enc.Utf8);
};

const getUser = (username) => {
  console.log("Username: ", username);
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) {
        console.log("Rej err: ", err);
        return reject(err);
      }

      console.log("Res row: ", row);
      resolve(row);
    });
  });
};

const addUser = (username, hashedPassword) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
};

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExists = await getUser(username);
    console.log("Existing user: ", userExists);
    if (userExists) {
      return res.status(400).send("User already exists. Please log in.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await addUser(username, hashedPassword);
    res.status(200).send({ message: "User registered", user_id: userId });
  } catch (error) {
    res.status(500).send("Error registering user");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await getUser(username);
    console.log("User: ", user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log("Sending Invalid Response...")
      return res.status(400).send("Invalid credentials");
    } else {
      console.log("Sending Valid response...")
      res.status(200).send({ message: "User authenticated", user_id: user.id });
    }
  } catch (error) {
    res.status(500).send("Error logging in user");
  }
});

const getPassword = (user_id, site) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM passwords WHERE user_id = ? AND (site LIKE ? OR username LIKE ?)",
      [user_id, `%${site}%`, `%${site}%`],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
};

const addPassword = (user_id, site, username, encryptedPassword) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO passwords (user_id, site, username, password) VALUES (?, ?, ?, ?)",
      [user_id, site, username, encryptedPassword],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
};

const updatePassword = (user_id, site, username, encryptedPassword) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE passwords SET password = ? WHERE user_id = ? AND site = ? AND username = ?",
      [encryptedPassword, user_id, site, username],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
  });
};

const deletePassword = (user_id, site, username) => {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM passwords WHERE user_id = ? AND site = ? AND username = ?",
      [user_id, site, username],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
  });
};

app.post("/store-password", async (req, res) => {
  const { user_id, site, username, password } = req.body;
  const encryptedPassword = encryptPassword(password);

  try {
    const rows = await getPassword(user_id, site);
    if (rows.length > 0) {
      return res
        .status(400)
        .send("Password already exists for this site and username");
    }

    await addPassword(user_id, site, username, encryptedPassword);
    res.status(200).send("Password stored successfully");
  } catch (error) {
    res.status(500).send("Error storing password");
  }
});

app.post("/get-password", async (req, res) => {
  const { user_id, site } = req.body;

  try {
    const rows = await getPassword(user_id, site);
    if (rows.length === 0) {
      return res.status(404).send("Password not found");
    }

    const results = rows.map((row) => ({
      site: row.site,
      username: row.username,
      password: decryptPassword(row.password),
    }));

    res.status(200).send(results);
  } catch (error) {
    res.status(500).send("Error retrieving password");
  }
});

app.post("/edit-password", async (req, res) => {
  const { user_id, site, username, newPassword } = req.body;
  const encryptedPassword = encryptPassword(newPassword);

  try {
    await updatePassword(user_id, site, username, encryptedPassword);
    res.status(200).send("Password updated");
  } catch (error) {
    res.status(500).send("Error updating password");
  }
});

app.post("/delete-password", async (req, res) => {
  const { user_id, site, username } = req.body;

  try {
    await deletePassword(user_id, site, username);
    res.status(200).send("Password deleted");
  } catch (error) {
    res.status(500).send("Error deleting password");
  }
});

app.listen(3000, () => {
  console.log("Password Manager Server running on port 3000...");
  console.log("Do not close. Unless you wanna turn off the password manager extension");
  console.log("To shutdown the server. Hit ctrl + C");
});

createTables();
