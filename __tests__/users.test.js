const app = require("../app");
const request = require("supertest");
const database = require("../config/db");
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

let accessToken;
let falseToken = "aaabbbccc111222333";

beforeAll(async () => {
  await database.collection("Users").insertOne({
    name: "Goerge Martin",
    username: "martinGG",
    email: "g.martin@email.com",
    password: hashPassword("password123"),
  });
  let user = await database
    .collection("Users")
    .findOne({ email: "g.martin@email.com" });
  accessToken = signToken({
    id: user._id,
    name: user.name,
    email: user.email,
  });
});

afterAll(async () => {
  await database.collection("Users").deleteOne({ email: "john.doe@email.com" });
  await database.collection("Users").deleteOne({ email: "g.martin@email.com" });
});

describe("POST /register", () => {
  test("Should return 201 and a success response", async () => {
    let { status, body } = await request(app).post("/register").send({
      name: "John Doe",
      username: "john.doe",
      email: "john.doe@email.com",
      password: "password123",
    });
    expect(status).toBe(201);
    expect(body.newUser).toHaveProperty("acknowledged", expect.any(Boolean));
    expect(body.newUser).toHaveProperty("insertedId", expect.any(String));
  });
  test("Should return 400 and an error response", async () => {
    let { status, body } = await request(app).post("/register").send({
      name: "",
      username: "mary.sue",
      email: "mary.sue@email.com",
      password: "password123",
    });
    expect(status).toBe(400);
    expect(body).toEqual({ message: "Please fill all the data" });
  });
  test("Should return 400 and an error response", async () => {
    let { status, body } = await request(app).post("/register").send({
      name: "Mary Sue",
      username: "",
      email: "mary.sue@email.com",
      password: "password123",
    });
    expect(status).toBe(400);
    expect(body).toEqual({ message: "Please fill all the data" });
  });
  test("Should return 400 and an error response", async () => {
    let { status, body } = await request(app).post("/register").send({
      name: "Mary Sue",
      username: "mary.sue",
      email: "",
      password: "password123",
    });
    expect(status).toBe(400);
    expect(body).toEqual({ message: "Please fill all the data" });
  });
  test("Should return 400 and an erro, response", async () => {
    let { status, body } = await request(app).post("/register").send({
      name: "Mary Sue",
      username: "mary.sue",
      email: "mary.sue@email.com",
      password: "",
    });
    expect(status).toBe(400);
    expect(body).toEqual({ message: "Please fill all the data" });
  });
  test("Should return 400 and an error response", async () => {
    let { status, body } = await request(app).post("/register").send({
      name: "Goerge Martin",
      username: "martinGG",
      email: "g.martin@email.com",
      password: "password123",
    });
    expect(status).toBe(400);
    expect(body).toEqual({ message: "This email has been used" });
  });
  test("Should return 400 and an error response", async () => {
    let { status, body } = await request(app).post("/register").send({
      name: "Goerge Martin",
      username: "martinGG",
      email: "gg.martin@email.com",
      password: "password123",
    });
    console.log(status, body, "<<<<<<<<<<<<<<,");
    expect(status).toBe(400);
    expect(body).toEqual({ message: "This username has been used" });
  });
});

describe("POST /login", () => {
  test("Should return 200 and an access token", async () => {
    let { status, body } = await request(app).post("/login").send({
      email: "g.martin@email.com",
      password: "password123",
    });
    console.log(accessToken, "<<<<<<<<<<<<<<");
    expect(status).toBe(200);
    expect(body).toHaveProperty("accessToken", expect.any(String));
  });
  test("Should return 400 and an error message (Incorret Email)", async () => {
    let { status, body } = await request(app).post("/login").send({
      email: "gg.martin@email.com",
      password: "password123",
    });
    expect(status).toBe(400);
    expect(body).toEqual({ message: "Invalid Email/Password" });
  });
  test("Should return 400 and an error message (Incorrect Password)", async () => {
    let { status, body } = await request(app).post("/login").send({
      email: "g.martin@email.com",
      password: "password12",
    });
    expect(status).toBe(400);
    expect(body).toEqual({ message: "Invalid Email/Password" });
  });
  test("Should return 400 and an error message (Email missing)", async () => {
    let { status, body } = await request(app).post("/login").send({
      email: "",
      password: "password123",
    });
    expect(status).toBe(400);
    expect(body).toEqual({ message: "Invalid Email/Password" });
  });
  test("Should return 400 and an error message (Password missing)", async () => {
    let { status, body } = await request(app).post("/login").send({
      email: "g.martin@email.com",
      password: "",
    });
    expect(status).toBe(400);
    expect(body).toEqual({ message: "Invalid Email/Password" });
  });
});

describe("GET /profile", () => {
  test("Should return 200 and an object", async () => {
    const { status, body } = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(status).toBe(200);
    expect(body).toBeInstanceOf(Object);
  });
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
    expect(body).toHaveProperty("message", "Authentication error");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app).get("/course/my-course");
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "Authentication error");
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
    expect(body).toHaveProperty("message", "Authentication error");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app).get("/course/my-course/4");
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "Authentication error");
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
    expect(body).toHaveProperty("message", "Authentication error");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app).post("/course/unlock-course");
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "Authentication error");
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
    expect(body).toHaveProperty("message", "Authentication error");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app).post("/course/complete-course");
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "Authentication error");
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
    expect(body).toHaveProperty("message", "Authentication error");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app).post("/course/get-quiz");
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "Authentication error");
  });
});

describe("POST /course/submit-quiz", () => {
  test("Should return 200 and a success response", async () => {
    let { status, body } = await request(app)
      .post("/course/submit-quiz")
      .send(Object)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(status).toBe(200);
    expect(body).toBeInstanceOf(Object);
  });
  test("Should return 401 and a unathorized response, wrong token", async () => {
    let { status, body } = await request(app)
      .post("/course/submit-quiz")
      .send(Object)
      .set("Authorization", `Bearer ${falseToken}`);
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "Authentication error");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app)
      .post("/course/submit-quiz")
      .send(Object);
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "Authentication error");
  });
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
    expect(body).toHaveProperty("message", "Authentication error");
  });
  test("Should return 401 and a success response, token does not exist", async () => {
    let { status, body } = await request(app).post("/shop/add-coin");
    expect(status).toBe(401);
    expect(body).toHaveProperty("message", "Authentication error");
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
