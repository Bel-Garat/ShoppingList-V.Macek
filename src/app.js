require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const shoppingListRoutes = require("./routes/shoppingListRoutes");
const { auth } = require("./middleware/auth");

const app = express();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set. Check your .env file.");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB:", MONGODB_URI);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });


app.use(express.json());


app.use(auth);

app.use("/shoppingList", shoppingListRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    errorCode: "notFound",
    message: "Endpoint not found."
  });
});


app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    errorCode: err.code || "internalServerError",
    message: err.message || "Unexpected error."
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Shopping List CRUD API listening on port ${PORT}`);
});