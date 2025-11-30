const ShoppingList = require("../models/ShoppingList");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function invalidDtoIn(res, message, param) {
  return res.status(400).json({
    errorCode: "invalidDtoIn",
    message,
    param
  });
}

//shoppingList/create
async function create(req, res, next) {
  try {
    const { title, description } = req.body;

    if (!isNonEmptyString(title)) {
      return invalidDtoIn(res, "title must be a non-empty string.", "title");
    }

    const list = await ShoppingList.create({
      title,
      description: description || "",
      ownerId: req.user.id
    });

    return res.json(mapListToDtoOut(list));
  } catch (e) {
    next(e);
  }
}

//shoppingList/get
async function get(req, res, next) {
  try {
    const { id } = req.query;
    if (!isNonEmptyString(id)) {
      return invalidDtoIn(res, "id must be a non-empty string.", "id");
    }

    const list = await ShoppingList.findById(id);
    if (!list) {
      return res.status(404).json({
        errorCode: "listNotFound",
        message: "Shopping list not found."
      });
    }

    return res.json(mapListToDtoOut(list));
  } catch (e) {
    next(e);
  }
}

//shoppingList/listMine
async function listMine(req, res, next) {
  try {
    const { includeArchived } = req.query;
    let includeArch = false;
    if (typeof includeArchived !== "undefined") {
      if (includeArchived !== "true" && includeArchived !== "false") {
        return invalidDtoIn(res, "includeArchived must be 'true' or 'false' if provided.", "includeArchived");
      }
      includeArch = includeArchived === "true";
    }

    const userId = req.user.id;

    const query = {
      $or: [{ ownerId: userId }, { "members.userId": userId }]
    };
    if (!includeArch) {
      query.isArchived = false;
    }

    const lists = await ShoppingList.find(query).sort({ createdAt: -1 });

    const dtoOut = {
      itemList: lists.map((list) => ({
        id: String(list._id),
        title: list.title,
        isArchived: list.isArchived,
        role: list.ownerId === userId ? "owner" : "member"
      }))
    };

    return res.json(dtoOut);
  } catch (e) {
    next(e);
  }
}

//shoppingList/archive
async function archive(req, res, next) {
  try {
    const { id, archive } = req.body;
    if (!isNonEmptyString(id)) {
      return invalidDtoIn(res, "id must be a non-empty string.", "id");
    }
    if (typeof archive !== "boolean") {
      return invalidDtoIn(res, "archive must be boolean.", "archive");
    }

    const list = await ShoppingList.findByIdAndUpdate(
      id,
      { isArchived: archive },
      { new: true }
    );
    if (!list) {
      return res.status(404).json({
        errorCode: "listNotFound",
        message: "Shopping list not found."
      });
    }

    return res.json({
      id: String(list._id),
      isArchived: list.isArchived
    });
  } catch (e) {
    next(e);
  }
}

//shoppingList/delete
async function removeList(req, res, next) {
  try {
    const { id } = req.body;
    if (!isNonEmptyString(id)) {
      return invalidDtoIn(res, "id must be a non-empty string.", "id");
    }

    const deleted = await ShoppingList.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        errorCode: "listNotFound",
        message: "Shopping list not found."
      });
    }

    return res.json({
      id,
      deleted: true
    });
  } catch (e) {
    next(e);
  }
}

//shoppingList/update
async function update(req, res) {
  try {
    const { id, title, description } = req.body;

    if (!id) {
      return res.status(400).json({
        errorCode: "invalidData",
        message: "Missing id."
      });
    }

    const list = await ShoppingList.findById(id);

    if (!list) {
      return res.status(404).json({
        errorCode: "listNotFound",
        message: "Shopping list not found."
      });
    }

    if (list.ownerId !== req.user.id) {
      return res.status(403).json({
        errorCode: "forbidden",
        message: "You are not the owner of this list."
      });
    }

    if (title !== undefined) list.title = title;
    if (description !== undefined) list.description = description;

    await list.save();
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errorCode: "internalServerError",
      message: err.message
    });
  }
}


//shoppingList/member/add
async function addMember(req, res, next) {
  try {
    const { listId, userId } = req.body;

    if (!isNonEmptyString(listId)) {
      return invalidDtoIn(res, "listId must be a non-empty string.", "listId");
    }
    if (!isNonEmptyString(userId)) {
      return invalidDtoIn(res, "userId must be a non-empty string.", "userId");
    }

    const list = await ShoppingList.findByIdAndUpdate(
      listId,
      { $addToSet: { members: { userId } } },
      { new: true }
    );
    if (!list) {
      return res.status(404).json({
        errorCode: "listNotFound",
        message: "Shopping list not found."
      });
    }

    return res.json({
      listId,
      members: list.members.map((m) => ({ userId: m.userId }))
    });
  } catch (e) {
    next(e);
  }
}

//shoppingList/member/remove
async function removeMember(req, res, next) {
  try {
    const { listId, userId } = req.body;

    if (!isNonEmptyString(listId)) {
      return invalidDtoIn(res, "listId must be a non-empty string.", "listId");
    }
    if (!isNonEmptyString(userId)) {
      return invalidDtoIn(res, "userId must be a non-empty string.", "userId");
    }

    const list = await ShoppingList.findByIdAndUpdate(
      listId,
      { $pull: { members: { userId } } },
      { new: true }
    );
    if (!list) {
      return res.status(404).json({
        errorCode: "listNotFound",
        message: "Shopping list not found."
      });
    }

    return res.json({
      listId,
      members: list.members.map((m) => ({ userId: m.userId }))
    });
  } catch (e) {
    next(e);
  }
}

//shoppingList/item/add
async function addItem(req, res, next) {
  try {
    const { listId, name, quantity } = req.body;

    if (!isNonEmptyString(listId)) {
      return invalidDtoIn(res, "listId must be a non-empty string.", "listId");
    }
    if (!isNonEmptyString(name)) {
      return invalidDtoIn(res, "name must be a non-empty string.", "name");
    }
    if (typeof quantity !== "undefined" && typeof quantity !== "number") {
      return invalidDtoIn(res, "quantity must be a number if provided.", "quantity");
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({
        errorCode: "listNotFound",
        message: "Shopping list not found."
      });
    }

    const item = {
      name,
      quantity: typeof quantity === "number" ? quantity : 1
    };
    list.items.push(item);
    await list.save();

    const newItem = list.items[list.items.length - 1];

    return res.json({
      listId,
      item: mapItem(newItem)
    });
  } catch (e) {
    next(e);
  }
}

//shoppingList/item/update
async function updateItem(req, res, next) {
  try {
    const { listId, itemId, name, quantity } = req.body;

    if (!isNonEmptyString(listId)) {
      return invalidDtoIn(res, "listId must be a non-empty string.", "listId");
    }
    if (!isNonEmptyString(itemId)) {
      return invalidDtoIn(res, "itemId must be a non-empty string.", "itemId");
    }
    if (typeof name !== "undefined" && !isNonEmptyString(name)) {
      return invalidDtoIn(res, "name must be a non-empty string if provided.", "name");
    }
    if (typeof quantity !== "undefined" && typeof quantity !== "number") {
      return invalidDtoIn(res, "quantity must be a number if provided.", "quantity");
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({
        errorCode: "listNotFound",
        message: "Shopping list not found."
      });
    }

    const item = list.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        errorCode: "itemNotFound",
        message: "Item not found in this list."
      });
    }

    if (typeof name === "string") item.name = name;
    if (typeof quantity === "number") item.quantity = quantity;

    await list.save();

    return res.json({
      listId,
      item: mapItem(item)
    });
  } catch (e) {
    next(e);
  }
}

//shoppingList/item/remove
async function removeItem(req, res, next) {
  try {
    const { listId, itemId } = req.body;

    if (!isNonEmptyString(listId)) {
      return invalidDtoIn(res, "listId must be a non-empty string.", "listId");
    }
    if (!isNonEmptyString(itemId)) {
      return invalidDtoIn(res, "itemId must be a non-empty string.", "itemId");
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({
        errorCode: "listNotFound",
        message: "Shopping list not found."
      });
    }

    const item = list.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        errorCode: "itemNotFound",
        message: "Item not found in this list."
      });
    }

    item.remove();
    await list.save();

    return res.json({
      listId,
      removedItemId: itemId
    });
  } catch (e) {
    next(e);
  }
}

//shoppingList/item/setCompleted
async function setItemCompleted(req, res, next) {
  try {
    const { listId, itemId, completed } = req.body;

    if (!isNonEmptyString(listId)) {
      return invalidDtoIn(res, "listId must be a non-empty string.", "listId");
    }
    if (!isNonEmptyString(itemId)) {
      return invalidDtoIn(res, "itemId must be a non-empty string.", "itemId");
    }
    if (typeof completed !== "boolean") {
      return invalidDtoIn(res, "completed must be boolean.", "completed");
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({
        errorCode: "listNotFound",
        message: "Shopping list not found."
      });
    }

    const item = list.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        errorCode: "itemNotFound",
        message: "Item not found in this list."
      });
    }

    item.isCompleted = completed;
    await list.save();

    return res.json({
      listId,
      item: {
        id: String(item._id),
        isCompleted: item.isCompleted
      }
    });
  } catch (e) {
    next(e);
  }
}

function mapItem(item) {
  return {
    id: String(item._id),
    name: item.name,
    quantity: item.quantity,
    isCompleted: item.isCompleted,
    createdAt: item.createdAt.toISOString()
  };
}

function mapListToDtoOut(list) {
  return {
    id: String(list._id),
    title: list.title,
    description: list.description,
    ownerId: list.ownerId,
    members: list.members.map((m) => ({ userId: m.userId })),
    items: list.items.map(mapItem),
    isArchived: list.isArchived,
    createdAt: list.createdAt.toISOString()
  };
}

module.exports = {
  create,
  get,
  listMine,
  archive,
  update,
  removeList,
  addMember,
  removeMember,
  addItem,
  updateItem,
  removeItem,
  setItemCompleted
};