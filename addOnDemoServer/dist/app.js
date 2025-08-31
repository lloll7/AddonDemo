"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var http_errors_1 = __importDefault(require("http-errors"));
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var morgan_1 = __importDefault(require("morgan"));
// 新
var debug_1 = __importDefault(require("debug"));
var debug = (0, debug_1.default)("server:server");
var http_1 = __importDefault(require("http"));
// import indexRouter from "./routes/index";
// import userRouter from "./routes/user.ts";
var user_1 = __importDefault(require("./routes/user"));
var cors_1 = __importDefault(require("cors"));
var app = (0, express_1.default)();
app.use((0, cors_1.default)()); // 启用 CORS，允许前端跨域请求
// 新
var port = process.env.PORT || "3000";
app.set("port", port);
var server = http_1.default.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }
    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind;
    if (typeof addr === "string") {
        bind = "pipe " + addr;
        debug("Listening on " + bind);
        console.log("\u670D\u52A1\u5668\u8FD0\u884C\u5728 ".concat(bind));
    }
    else if (addr && typeof addr === "object") {
        bind = "port " + addr.port;
        debug("Listening on " + bind);
        console.log("\u670D\u52A1\u5668\u8FD0\u884C\u5728 http://localhost:".concat(addr.port));
    }
    else {
        debug("无法获取服务器地址信息");
        console.log("无法获取服务器地址信息");
    }
}
app.use((0, cors_1.default)({
    origin: "http://localhost:5174", // Vite 默认端口
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
}));
app.options("*", (0, cors_1.default)());
// view engine setup
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// app.use("/", indexRouter);
app.use("/user", user_1.default);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next((0, http_errors_1.default)(404));
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render("error");
});
module.exports = app;
