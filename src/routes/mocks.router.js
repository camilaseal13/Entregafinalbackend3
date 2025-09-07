import { Router } from "express";
import { generateUsers, generatePets } from "../utils/mocking.utils.js";
import userModel from "../dao/models/User.js";
import petModel from "../dao/models/Pet.js";

const router = Router();

router.get("/mockingpets", (req, res) => {
  const count = Number(req.query.count) || 100;
  const pets = generatePets(count);
  res.send({ status: "success", count: pets.length, payload: pets });
});

router.get("/mockingusers", async (req, res) => {
  try {
    const count = Number(req.query.count) || 50;
    const users = await generateUsers(count, { withMongoLikeIds: true });
    res.send({ status: "success", count: users.length, payload: users });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ status: "error", error: "Error generando usuarios" });
  }
});

router.post("/generateData", async (req, res) => {
  try {
    const usersQty = Number(req.body?.users) || 0;
    const petsQty = Number(req.body?.pets) || 0;

    const usersData = await generateUsers(usersQty);
    const petsData = generatePets(petsQty);

    const [usersInsert, petsInsert] = await Promise.all([
      usersQty > 0
        ? userModel.insertMany(usersData, { ordered: false })
        : Promise.resolve([]),
      petsQty > 0
        ? petModel.insertMany(petsData, { ordered: false })
        : Promise.resolve([]),
    ]);

    res.send({
      status: "success",
      inserted: { users: usersInsert.length, pets: petsInsert.length },
      samples: {
        user: usersInsert[0] || null,
        pet: petsInsert[0] || null,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({
        status: "error",
        error: "Error generando/insertando datos",
        details: err?.message,
      });
  }
});

export default router;
