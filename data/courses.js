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
    console.log(user);
  // accessToken = signToken({
  //   _id: user._id,
  //   name: user.name,
  //   email: user.email,
  // });
});

afterAll(async () => {
  await database.collection("Users").deleteOne({ email: "g.martin@email.com" });
  await database.collection("Courses").deleteMany();
});

describe("GET /course", () => {
  test("Should return 200 and a success response", async () => {
    let { status, body } = await request(app).get("/course");
    expect(status).toBe(200);
    expect(body).toBeInstanceOf(Object);
  });
});

describe("GET /course/my-course", () => {
  test("Should return 200 and a success response", async () => {
    let { status, body } = await request(app)
      .get("/course/my-course")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(status).toBe(200);
    expect(body).toBeInstanceOf(Object);
  });
  test("Should return 401 and a unathorized response, wrong token", async () => {
    let { status, body } = await request(app)
      .get("/course/my-course")
      .set("Authorization", `Bearer ${falseToken}`);
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app).get("/course/my-course");
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
});

describe("GET /course/my-course/:detail", () => {
  test("Should return 200 and a success response", async () => {
    let { status, body } = await request(app)
      .get("/course/my-course/4")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(status).toBe(200);
    expect(body).toBeInstanceOf(Object);
  });
  test("Should return 401 and a unathorized response, wrong token", async () => {
    let { status, body } = await request(app)
      .get("/course/my-course/4")
      .set("Authorization", `Bearer ${falseToken}`);
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app).get("/course/my-course/4");
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
});

describe("POST /course/unlock-course", () => {
  test("Should return 200 and a success response", async () => {
    let { status, body } = await request(app)
      .post("/course/unlock-course")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(status).toBe(200);
    expect(body).toBeInstanceOf(Object);
  });
  test("Should return 401 and a unathorized response, wrong token", async () => {
    let { status, body } = await request(app)
      .post("/course/unlock-course")
      .set("Authorization", `Bearer ${falseToken}`);
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app).post("/course/unlock-course");
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
});

describe("POST /course/complete-course", () => {
  test("Should return 200 and a success response", async () => {
    let { status, body } = await request(app)
      .post("/course/complete-course")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(status).toBe(200);
    expect(body).toBeInstanceOf(Object);
  });
  test("Should return 401 and a unathorized response, wrong token", async () => {
    let { status, body } = await request(app)
      .post("/course/complete-course")
      .set("Authorization", `Bearer ${falseToken}`);
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app).post("/course/complete-course");
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
});

describe("POST /course/get-quiz", () => {
  test("Should return 200 and a success response", async () => {
    let { status, body } = await request(app)
      .post("/course/get-quiz")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(status).toBe(200);
    expect(body).toBeInstanceOf(Object);
  });
  test("Should return 401 and a unathorized response, wrong token", async () => {
    let { status, body } = await request(app)
      .post("/course/get-quiz")
      .set("Authorization", `Bearer ${falseToken}`);
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app).post("/course/get-quiz");
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
});

describe("POST /course/submit-quiz", () => {
  test("Should return 200 and a success response", async () => {
    let { status, body } = await request(app)
      .post("/course/submit-quiz")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(status).toBe(200);
    expect(body).toBeInstanceOf(Object);
  });
  test("Should return 401 and a unathorized response, wrong token", async () => {
    let { status, body } = await request(app)
      .post("/course/submit-quiz")
      .set("Authorization", `Bearer ${falseToken}`);
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app).post("/course/submit-quiz");
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "You are not authorized");
  });
});
