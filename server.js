const express = require("express");
const dotenv = require("dotenv");
const storeRoutes = require("./routes/storeRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", storeRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
