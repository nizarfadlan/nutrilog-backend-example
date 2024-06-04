import express from "express";
import type { Request, Response } from "express";
import { errorHandler } from "./middlewares/errors";
import { prisma } from "./db";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;
const PASSWORD_HASH_SALT_ROUNDS = 10;

app.use(express.json());
app.use(express.static("public"));
app.use(errorHandler);
app.set("view engine", "ejs");

app.get("/", (req: Request, res: Response) => {
  res.success("Nutrition App is running");
});

app.post("/login", async(req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.error("Email and password are required", null, 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!user) {
    res.error("Wrong email or password", null, 400);
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    res.error("Wrong email or password", null, 400);
  }

  res.success("Successfully user login", {
    id: user.id,
    name: user.name,
    email: user.email,
    token: user.token
  });
});

app.post("/register", async(req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (name === "" || email === "" || password === "") {
    res.error("Name, email and password are required", null, 400);
  }

  const token = Math.random().toString(36).substring(2);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, PASSWORD_HASH_SALT_ROUNDS),
      token
    }
  });

  if (!user) {
    res.error("Error registering user", null, 400);
  }

  res.success("Successfully user registered");
});

app.get("/nutrients", async(req: Request, res: Response) => {
  const { date } = req.query;
  const headers = req.headers;

  if (!headers.authorization) {
    res.error("Unauthorized", null, 401);
  }

  if (!date) {
    res.error("Date is required", null, 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      token: headers.authorization,
    }
  });

  const nutrients = await prisma.nutrition.findMany({
    where: {
      userId: user.id,
      createdAt: new Date(date.toString())
    }
  });

  res.success("Nutrients retrieved", nutrients);
});

app.post("/analyze", async(req: Request, res: Response) => {
  const { food_name, carbohydrate, proteins, fat, calories } = req.body;
  const headers = req.headers;

  if (!headers.authorization) {
    res.error("Unauthorized", null, 401);
  }

  if (!food_name || !carbohydrate || !proteins || !fat || !calories) {
    res.error("Food name, carbohydrate, proteins, fat and calories are required", null, 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      token: headers.authorization,
    }
  });

  const nutrition = await prisma.nutrition.create({
    data: {
      userId: user.id,
      foodName: food_name,
      carbohydrate,
      proteins,
      fat,
      calories
    }
  });

  res.success("Nutrition analyzed", nutrition);
});

// Change the route
// const upload = multer({ dest: "uploads/" });
// app.post("/predict", upload.single("image"), async (req: Request, res: Response) => {
//   const filePath = req.file?.path;
//   if (!filePath) {
//     return res.status(400).send("No file uploaded");
//   }

//   try {
//     const imageBuffer = await fs.readFile(filePath);


//     await fs.unlink(filePath);
//   } catch (error) {
//     console.error("Error processing image:", error);
//     res.status(500).send("Error processing image");
//   }
// });

app.listen(port, () => {
  return console.log(`http://localhost:${port}`);
});
