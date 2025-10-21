const pool = require("./db"); // uses the updated db/index.js

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        store_name VARCHAR(255),
        owner_name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        gst_number VARCHAR(50) UNIQUE NOT NULL,
        address TEXT,
        logo_url TEXT,
        api_key VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ 'stores' table created successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating table:", err);
    process.exit(1);
  }
})();
