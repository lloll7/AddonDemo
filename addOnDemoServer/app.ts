import "dotenv/config"; // 加载环境变量
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
// 新
import debugLib from "debug";
const debug = debugLib("server:server");
import http from "http";
import type { AddressInfo } from "net";

// 导入全局类型声明
// import "./ts/interface/global";

import userRouter from "./routes/user";
import deviceRouter from "./routes/device";
import AIBridge from "./routes/AIBridge";
import wsRouter, { initializeWebSocket } from "./routes/websocket";

import cors from "cors";
import { env } from "./ts/env";

const app = express();
app.use(cors()); // 启用 CORS，允许前端跨域请求

app.use(
  cors({
    origin: "*", // Vite 默认端口
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);
app.options("*", cors());

// 新
const port = env.PORT || "3001";
app.set("port", port);
const server = http.createServer(app);

// 在路由设置前添加静态文件服务
app.use(express.static(path.join(__dirname, "../public")));

// // 在所有API路由后添加回退到前端路由的处理
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/index.html"));
// });

server.listen(Number(port), "0.0.0.0", () => {
  const address = server.address() as AddressInfo;
  console.log(`Server running at http://${address.address}:${address.port}`);
});
server.on("error", onError);
server.on("listening", onListening);

// 初始化 WebSocket 服务器
initializeWebSocket(server);
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
  const addr = server.address() as AddressInfo | string | null;
  let bind: string;
  if (typeof addr === "string") {
    bind = "pipe " + addr;
    debug("Listening on " + bind);
    console.log(`服务器运行在 ${bind}`);
  } else if (addr && typeof addr === "object") {
    bind = "port " + addr.port;
    debug("Listening on " + bind);
    console.log(`服务器运行在 http://localhost:${addr.port}`);
  } else {
    debug("无法获取服务器地址信息");
    console.log("无法获取服务器地址信息");
  }
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/device", deviceRouter);
app.use("/ws", wsRouter);
app.use("/bridge", AIBridge);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
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
