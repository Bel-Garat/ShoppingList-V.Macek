const express = require("express");
const router = express.Router();
const controller = require("../controllers/shoppingListController");
const { requireProfiles } = require("../middleware/auth");

//ShoppingList
router.post("/create", requireProfiles(["user", "owner"]), controller.create);
router.get("/get", requireProfiles(["user", "owner", "member"]), controller.get);
router.get("/listMine", requireProfiles(["user", "owner", "member"]), controller.listMine);
router.post("/archive", requireProfiles(["owner"]), controller.archive);
router.delete("/delete", requireProfiles(["owner"]), controller.removeList);
router.post("/update", requireProfiles(["owner"]), controller.update);

//Members
router.post("/member/add", requireProfiles(["owner"]), controller.addMember);
router.post("/member/remove", requireProfiles(["owner"]), controller.removeMember);

//Items
router.post("/item/add", requireProfiles(["owner", "member"]), controller.addItem);
router.post("/item/update", requireProfiles(["owner", "member"]), controller.updateItem);
router.post("/item/remove", requireProfiles(["owner", "member"]), controller.removeItem);
router.post("/item/setCompleted", requireProfiles(["owner", "member"]), controller.setItemCompleted);

module.exports = router;