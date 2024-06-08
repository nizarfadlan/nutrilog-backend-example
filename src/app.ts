import express from "express";
import type { Request, Response } from "express";
import { errorHandler } from "./middlewares/errors";
import { prisma } from "./db";
import bcrypt from "bcrypt";
import { authHandler } from "./middlewares/auth";
import { PASSWORD_HASH_SALT_ROUNDS } from "./constant";
import jwt from "jsonwebtoken";
import { Gender } from "@prisma/client"

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));
app.use(errorHandler);
app.set("view engine", "ejs");

app.get("/", (req: Request, res: Response) => {
  res.success("Nutrition App is running");
});

app.post("/login", async(req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.error("Email and password are required", null, 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!user) {
    return res.error("Wrong email or password", null, 400);
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    return res.error("Wrong email or password", null, 400);
  }

  const payload = {
    id: user.id,
  }
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  res.success("Successfully user login", {
    id: user.id,
    name: user.name,
    email: user.email,
    gender: user.gender,
    age: user.age,
    token
  });
});

app.post("/register", async(req: Request, res: Response) => {
  const { name, email, password, gender, age } = req.body;

  if (!name || !email || !password || !gender || !age) {
    return res.error("Name, email, password and gender are required", null, 400);
  } else if (password.length < 8) {
    return res.error("Password must be at least 8 characters", null, 400);
  } else if (!Object.values(Gender).includes(gender)) {
    return res.error("Invalid gender value");
  } else if (age.length < 0) {
    return res.error("Age must be greater than 0", null, 400);
  }

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, PASSWORD_HASH_SALT_ROUNDS),
        gender,
        age
      }
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.error("Email already exists", null, 400);
    }

    return res.error("Error registering user", null, 400);
  }

  res.success("Successfully user registered");
});

app.get("/nutrients", authHandler, async(req: Request, res: Response) => {
  const { date } = req.query;

  if (!date) {
    return res.error("Date is required", null, 400);
  }

  const startOfDay = new Date(date.toString());
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const nutrients = await prisma.nutrition.findMany({
    where: {
      userId: req.user.id,
      createdAt: {
        gte: startOfDay,
        lt: endOfDay
      }
    }
  });

  res.success("Nutrients retrieved", nutrients);
});

app.post("/analyze", authHandler, async(req: Request, res: Response) => {
  const { food_name, carbohydrate, proteins, fat, calories } = req.body;

  if (!food_name || !carbohydrate || !proteins || !fat || !calories) {
    return res.error("Food name, carbohydrate, proteins, fat and calories are required", null, 400);
  }

  const nutrition = await prisma.nutrition.create({
    data: {
      userId: req.user.id,
      foodName: food_name,
      carbohydrate,
      proteins,
      fat,
      calories
    }
  });

  res.success("Nutrition analyzed", nutrition);
});

app.listen(port, () => {
  return console.log(`http://localhost:${port}`);
});
