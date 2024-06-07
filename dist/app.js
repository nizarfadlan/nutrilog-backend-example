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
const auth_1 = require("./middlewares/auth");
const constant_1 = require("./constant");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
app.use(errors_1.errorHandler);
app.set("view engine", "ejs");
app.get("/", (req, res) => {
    res.success("Nutrition App is running");
});
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.error("Email and password are required", null, 400);
    }
    const user = yield db_1.prisma.user.findUnique({
        where: {
            email
        }
    });
    if (!user) {
        return res.error("Wrong email or password", null, 400);
    }
    const isValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isValid) {
        return res.error("Wrong email or password", null, 400);
    }
    const payload = {
        id: user.id,
    };
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET);
    res.success("Successfully user login", {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        token
    });
}));
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, gender, age } = req.body;
    if (!name || !email || !password || !gender) {
        return res.error("Name, email, password and gender are required", null, 400);
    }
    else if (password.length < 8) {
        return res.error("Password must be at least 8 characters", null, 400);
    }
    else if (!Object.values(client_1.Gender).includes(gender)) {
        return res.error("Invalid gender value");
    }
    else if (age.length < 0) {
        return res.error("Age must be greater than 0", null, 400);
    }
    try {
        yield db_1.prisma.user.create({
            data: {
                name,
                email,
                password: yield bcrypt_1.default.hash(password, constant_1.PASSWORD_HASH_SALT_ROUNDS),
                gender,
                age
            }
        });
    }
    catch (error) {
        if (error.code === "P2002") {
            return res.error("Email already exists", null, 400);
        }
        return res.error("Error registering user", null, 400);
    }
    res.success("Successfully user registered");
}));
app.get("/nutrients", auth_1.authHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date } = req.query;
    if (!date) {
        return res.error("Date is required", null, 400);
    }
    const startOfDay = new Date(date.toString());
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const nutrients = yield db_1.prisma.nutrition.findMany({
        where: {
            userId: req.user.id,
            createdAt: {
                gte: startOfDay,
                lt: endOfDay
            }
        }
    });
    res.success("Nutrients retrieved", nutrients);
}));
app.post("/analyze", auth_1.authHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { food_name, carbohydrate, proteins, fat, calories } = req.body;
    if (!food_name || !carbohydrate || !proteins || !fat || !calories) {
        return res.error("Food name, carbohydrate, proteins, fat and calories are required", null, 400);
    }
    const nutrition = yield db_1.prisma.nutrition.create({
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
}));
app.listen(port, () => {
    return console.log(`http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map