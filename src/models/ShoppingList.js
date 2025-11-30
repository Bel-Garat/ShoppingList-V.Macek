const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    isCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const MemberSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }
  },
  { _id: false }
);

const ShoppingListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  ownerId: { type: String, required: true },
  members: { type: [MemberSchema], default: [] },
  items: { type: [ItemSchema], default: [] },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ShoppingList", ShoppingListSchema);