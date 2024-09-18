const app = require("../app");
const request = require("supertest");
const database = require("../config/db");
const courseTest = require("./biology1.json");
import { signToken } from "../helpers/jwt";

const userTest = {
  name: "George Martin",
  username: "martinGG",
  email: "g.martin@email.com",
  password: hashPassword("password123"),
};

let accessToken;
let falseToken = "aaabbbccc111222333";

beforeAll(async () => {
  await database.collection("Courses").insertOne(courseTest);
  await database.collection("Users").insertOne(userTest);
  let user = await database
    .collection("Users")
    .findOne({ where: "g.martin@email.com" });
  accessToken = signToken({
    _id: user._id,
    name: user.name,
    email: user.email,
  });
});

afterAll(async () => {
  await database.collection("Users").deleteOne({ email: "g.martin@email.com" });
  await database.collection("Courses").deleteMany();
});

describe("POST /shop/add-coin", () => {
  test("Should return 200 and a success response", async () => {
    let { status, body } = await request(app)
      .post("/shop/add-coin")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(status).toBe(200);
    expect(body).toBeInstanceOf(Object);
  });
  test("Should return 401 and a unathorized response, wrong token", async () => {
    let { status, body } = await request(app)
      .post("/shop/add-coin")
      .set("Authorization", `Bearer ${falseToken}`);
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app).post("/shop/add-coin");
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
});

describe("POST /payment-notification-handler", () => {
  test("Should return 200 and a success response", async () => {
    let { status, body } = await request(app).post(
      "/payment-notification-handler"
    );
    expect(status).toBe(200);
    expect(body).toBeInstanceOf(Object);
  });
});