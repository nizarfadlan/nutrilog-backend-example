"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authHandler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.error("Unauthorized", 401);
    }
    const token = authHeader.split(" ")[1];
    try {
        // The ignoreExpiration option is used to ignore the expiration of the token
        // This is useful when you want to check if the token is valid but don't want to throw an error if it's expired
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
        req.user = decoded;
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.error("Token expired", 401);
        }
        else {
            return res.error("Internal server error", 500);
        }
    }
};
exports.authHandler = authHandler;
//# sourceMappingURL=auth.js.map