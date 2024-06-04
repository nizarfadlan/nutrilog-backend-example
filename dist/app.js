"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errors_1 = require("./middlewares/errors");
const db_1 = require("./db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const app = (0, express_1.default)();
const port = 3000;
const PASSWORD_HASH_SALT_ROUNDS = 10;
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
app.use(errors_1.errorHandler);
app.set("view engine", "ejs");
app.get("/", (req, res) => {
    res.success("Nutrition App is running");
});
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (email === "" || password === "") {
        res.error("Email and password are required", null, 400);
    }
    const user = yield db_1.prisma.user.findUnique({
        where: {
            email
        }
    });
    if (!user) {
        res.error("Wrong email or password", null, 400);
    }
    const isValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isValid) {
        res.error("Wrong email or password", null, 400);
    }
    res.success("Login successful", {
        id: user.id,
        name: user.name,
        email: user.email,
        token: user.token
    });
}));
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if (name === "" || email === "" || password === "") {
        res.error("Name, email and password are required", null, 400);
    }
    const token = Math.random().toString(36).substring(2);
    const user = yield db_1.prisma.user.create({
        data: {
            name,
            email,
            password: yield bcrypt_1.default.hash(password, PASSWORD_HASH_SALT_ROUNDS),
            token
        }
    });
    if (!user) {
        res.error("Error registering user", null, 400);
    }
    res.success("User registered");
}));
app.get("/nutrients", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date } = req.query;
    const headers = req.headers;
    if (!headers.authorization) {
        res.error("Unauthorized", null, 401);
    }
    if (!date) {
        res.error("Date is required", null, 400);
    }
    const user = yield db_1.prisma.user.findFirst({
        where: {
            token: headers.authorization,
        }
    });
    const nutrients = yield db_1.prisma.nutrition.findMany({
        where: {
            userId: user.id,
            createdAt: new Date(date.toString())
        }
    });
    res.success("Nutrients retrieved", nutrients);
}));
app.post("/analyze", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { food_name, carbohydrate, proteins, fat, calories } = req.body;
    const headers = req.headers;
    if (!headers.authorization) {
        res.error("Unauthorized", null, 401);
    }
    if (!food_name || !carbohydrate || !proteins || !fat || !calories) {
        res.error("Food name, carbohydrate, proteins, fat and calories are required", null, 400);
    }
    const user = yield db_1.prisma.user.findFirst({
        where: {
            token: headers.authorization,
        }
    });
    const nutrition = yield db_1.prisma.nutrition.create({
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
}));
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
//# sourceMappingURL=app.js.map