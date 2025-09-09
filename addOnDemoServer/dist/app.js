"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // 加载环境变量
var http_errors_1 = __importDefault(require("http-errors"));
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var morgan_1 = __importDefault(require("morgan"));
// 新
var debug_1 = __importDefault(require("debug"));
var debug = (0, debug_1.default)("server:server");
var http_1 = __importDefault(require("http"));
// 导入全局类型声明
// import "./ts/interface/global";
var user_1 = __importDefault(require("./routes/user"));
var device_1 = __importDefault(require("./routes/device"));
var AIBridge_1 = __importDefault(require("./routes/AIBridge"));
var sse_1 = __importDefault(require("./routes/sse"));
var websocket_1 = __importStar(require("./routes/websocket"));
var cors_1 = __importDefault(require("cors"));
var env_1 = require("./ts/env");
var app = (0, express_1.default)();
app.use((0, cors_1.default)()); // 启用 CORS，允许前端跨域请求
app.use((0, cors_1.default)({
    origin: "*", // Vite 默认端口
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
}));
app.options("*", (0, cors_1.default)());
// 新
var port = env_1.env.PORT || "3001";
app.set("port", port);
var server = http_1.default.createServer(app);
// 在路由设置前添加静态文件服务
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
// // 在所有API路由后添加回退到前端路由的处理
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/index.html"));
// });
server.listen(Number(port), "0.0.0.0", function () {
    var address = server.address();
    console.log("Server running at http://".concat(address.address, ":").concat(address.port));
});
server.on("error", onError);
server.on("listening", onListening);
// 初始化 WebSocket 服务器
(0, websocket_1.initializeWebSocket)(server);
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
app.use("/device", device_1.default);
app.use("/sse", sse_1.default);
app.use("/ws", websocket_1.default);
app.use("/bridge", AIBridge_1.default);
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
