import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import userModel from "../src/dao/models/User.js";
import petModel from "../src/dao/models/Pet.js";
import adoptionModel from "../src/dao/models/Adoption.js";

describe("Adoption Router (functional)", function () {
  this.timeout(90000);

  let mongod;

  before(async function () {
    this.timeout(60000);
    mongoose.set("strictQuery", true);
    mongoose.set("bufferTimeoutMS", 60000);
    mongod = await MongoMemoryServer.create({
      binary: {
        version: "7.0.14",
        arch: process.arch === "arm64" ? "arm64" : undefined,
      },
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri, {
      dbName: "adoptme-test",
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
    });
    // ping defensivo
    const admin = mongoose.connection.db.admin();
    for (let i = 0; i < 10; i++) {
      try {
        await admin.command({ ping: 1 });
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 100));
      }
    }
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
    await petModel.deleteMany({});
    await adoptionModel.deleteMany({});
  });

  it("GET /api/adoptions should return empty list initially", async () => {
    const res = await request(app).get("/api/adoptions").expect(200);
    expect(res.body.status).to.equal("success");
    expect(res.body.payload).to.be.an("array");
    expect(res.body.payload.length).to.equal(0);
  });

  it("GET /api/adoptions/:aid should return 404 when not found", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/adoptions/${fakeId}`).expect(404);
    expect(res.body.status).to.equal("error");
  });

  it("POST /api/adoptions/:uid/:pid should return 404 if user not found", async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const pet = await petModel.create({
      name: "Milo",
      specie: "dog",
      adopted: false,
    });
    const res = await request(app)
      .post(`/api/adoptions/${userId}/${pet._id}`)
      .expect(404);
    expect(res.body.status).to.equal("error");
  });

  it("POST /api/adoptions/:uid/:pid should return 404 if pet not found", async () => {
    const user = await userModel.create({
      first_name: "Ana",
      last_name: "Pérez",
      email: "ana@test.com",
      password: "x",
    });
    const petId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/api/adoptions/${user._id}/${petId}`)
      .expect(404);
    expect(res.body.status).to.equal("error");
  });

  it("POST /api/adoptions/:uid/:pid should adopt a pet and create adoption", async () => {
    const user = await userModel.create({
      first_name: "Ana",
      last_name: "Pérez",
      email: "ana@test.com",
      password: "x",
      pets: [],
    });
    const pet = await petModel.create({
      name: "Luna",
      specie: "cat",
      adopted: false,
    });
    const res = await request(app)
      .post(`/api/adoptions/${user._id}/${pet._id}`)
      .expect(200);
    expect(res.body.status).to.equal("success");
    expect(res.body.message).to.match(/Pet adopted/i);

    const updatedPet = await petModel.findById(pet._id);
    expect(updatedPet.adopted).to.equal(true);
    expect(String(updatedPet.owner)).to.equal(String(user._id));

    const adoptions = await adoptionModel.find({
      owner: user._id,
      pet: pet._id,
    });
    expect(adoptions.length).to.equal(1);
  });

  it("POST /api/adoptions/:uid/:pid should return 400 if pet already adopted", async () => {
    const user = await userModel.create({
      first_name: "Ana",
      last_name: "Pérez",
      email: "ana@test.com",
      password: "x",
      pets: [],
    });
    const pet = await petModel.create({
      name: "Luna",
      specie: "cat",
      adopted: true,
      owner: user._id,
    });
    const res = await request(app)
      .post(`/api/adoptions/${user._id}/${pet._id}`)
      .expect(400);
    expect(res.body.status).to.equal("error");
  });

  it("GET /api/adoptions/:aid should return the adoption (success)", async function () {
    this.timeout(20000);

    const user = await userModel.create({
      first_name: "Mario",
      last_name: "Rossi",
      email: "mario@test.com",
      password: "x",
      pets: [],
    });

    const pet = await petModel.create({
      name: "Kira",
      specie: "dog",
      adopted: false,
    });

    // Crear adopción
    const createRes = await request(app)
      .post(`/api/adoptions/${user._id}/${pet._id}`)
      .expect(200);
    expect(createRes.body.status).to.equal("success");

    const adoptionDoc = await adoptionModel.findOne({
      owner: user._id,
      pet: pet._id,
    });
    await new Promise((r) => setTimeout(r, 50)); // pequeño delay defensivo
    expect(adoptionDoc).to.exist;

    // GET por :aid
    const getRes = await request(app)
      .get(`/api/adoptions/${adoptionDoc._id}`)
      .expect(200);

    expect(getRes.body.status).to.equal("success");
    expect(String(getRes.body.payload._id)).to.equal(String(adoptionDoc._id));
    expect(String(getRes.body.payload.owner)).to.equal(String(user._id));
    expect(String(getRes.body.payload.pet)).to.equal(String(pet._id));
  });
});
