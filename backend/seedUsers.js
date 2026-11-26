
const bcrypt = require("bcryptjs");
const db = require("./config/db");

async function createUsers() {
  try {
    const password = process.env.DEMO_PASSWORD;

    if (!password || password.length < 12) {
      throw new Error("Set a demo password of at least 12 characters");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const users = [
      ["Demo Employee", "employee@leavetrack.com", "Employee"],
      ["Demo Manager", "manager@leavetrack.com", "Manager"],
      ["Demo Admin", "admin@leavetrack.com", "Admin"],
    ];

    for (const [name, email, role] of users) {
      await db.execute(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = ?`,
        [name, email, passwordHash, role, name]
      );

      console.log(`${role} account ready`);
    }

    console.log("All demo accounts created successfully");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

createUsers();
