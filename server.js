const express = require("express");
const dotenv = require("dotenv");
const storeRoutes = require("./routes/storeRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");


dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", storeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
