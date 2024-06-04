"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (req, res, next) => {
    res.header("content-type", "application/json");
    res.success = (message, data = {}, statusCode = 200) => {
        res.status(statusCode).json({
            status: "success",
            message,
            data
        });
    };
    res.error = (message, data = {}, statusCode = 400) => {
        res.status(statusCode).json({
            status: "error",
            message,
            data
        });
    };
    next();
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errors.js.map