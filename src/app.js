import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import usersRouter from "./routes/users.router.js";
import petsRouter from "./routes/pets.router.js";
import adoptionsRouter from "./routes/adoption.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import mocksRouter from "./routes/mocks.router.js";

import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";

const usersSpec = yaml.load(new URL("./docs/users.yaml", import.meta.url));

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/adoptme";

app.use(express.json());
app.use(cookieParser());

app.use("/docs/users", swaggerUi.serve, swaggerUi.setup(usersSpec));

// Routers
app.use("/api/users", usersRouter);
app.use("/api/pets", petsRouter);
app.use("/api/adoptions", adoptionsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/mocks", mocksRouter);

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("MongoDB conectado ✅", MONGO_URI);
      app.listen(PORT, () => console.log(`Listening on ${PORT}`));
    })
    .catch((err) => {
      console.error("Error conectando a MongoDB ❌");
      console.error(err?.message || err);
    });
}

export default app;
