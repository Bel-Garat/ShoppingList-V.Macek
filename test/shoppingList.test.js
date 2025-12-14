
const request = require("supertest");
const app = require("../src/app");

describe("ShoppingList API tests", () => {
  let createdId;

  it("should create shopping list (happy day)", async () => {
    const res = await request(app)
      .post("/shoppingList/create")
      .set("x-user-profile", "owner")
      .set("x-user", JSON.stringify({ id: "user-123", name: "Test" }))
      .send({ title: "Test list", description: "test desc" });

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeDefined();
    createdId = res.body.id;
  });

  it("should list my shopping lists", async () => {
    const res = await request(app)
      .get("/shoppingList/list")
      .set("x-user-profile", "owner")
      .set("x-user", JSON.stringify({ id: "user-123", name: "Test" }));

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.itemList)).toBe(true);
  });

  it("should get shopping list by id", async () => {
    const res = await request(app)
      .get("/shoppingList/get")
      .query({ id: createdId })
      .set("x-user-profile", "owner")
      .set("x-user", JSON.stringify({ id: "user-123", name: "Test" }));

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdId);
  });

  it("should update shopping list", async () => {
    const res = await request(app)
      .post("/shoppingList/update")
      .set("x-user-profile", "owner")
      .set("x-user", JSON.stringify({ id: "user-123", name: "Test" }))
      .send({ id: createdId, title: "Updated title" });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated title");
  });

  it("should delete shopping list", async () => {
    const res = await request(app)
      .post("/shoppingList/delete")
      .set("x-user-profile", "owner")
      .set("x-user", JSON.stringify({ id: "user-123", name: "Test" }))
      .send({ id: createdId });

    expect(res.statusCode).toBe(200);
  });

  it("should fail without user profile header", async () => {
    const res = await request(app)
      .post("/shoppingList/create")
      .send({ title: "Fail test" });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});
