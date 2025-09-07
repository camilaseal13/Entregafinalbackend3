import crypto from "crypto";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

let CACHED_HASH = null;
export async function getCoderHash() {
  if (CACHED_HASH) return CACHED_HASH;
  const saltRounds = 10;
  CACHED_HASH = await bcrypt.hash("coder123", saltRounds);
  return CACHED_HASH;
}

export function fakeObjectId() {
  return crypto.randomBytes(12).toString("hex");
}

const ROLES = ["user", "admin"];

export async function generateUsers(n = 1, { withMongoLikeIds = false } = {}) {
  const passwordHash = await getCoderHash();
  const users = [];
  for (let i = 0; i < n; i++) {
    const first_name = faker.person.firstName();
    const last_name = faker.person.lastName();
    const email = faker.internet
      .email({ firstName: first_name, lastName: last_name })
      .toLowerCase();
    const role = ROLES[Math.floor(Math.random() * ROLES.length)];
    const doc = {
      first_name,
      last_name,
      email,
      password: passwordHash,
      role,
      pets: [],
    };
    if (withMongoLikeIds) {
      doc._id = fakeObjectId();
      doc.__v = 0;
      doc.createdAt = faker.date.past();
      doc.updatedAt = faker.date.recent();
    }
    users.push(doc);
  }
  return users;
}

export function generatePets(n = 1) {
  const species = ["dog", "cat", "bird", "fish", "rabbit"];
  const pets = [];
  for (let i = 0; i < n; i++) {
    const name = faker.person.firstName(); // 🔁 antes: faker.animal.petName()
    pets.push({
      name,
      specie: species[Math.floor(Math.random() * species.length)],
      birthDate: faker.date.birthdate({ min: 0, max: 15, mode: "age" }),
      adopted: false,
      owner: null,
    });
  }
  return pets;
}
