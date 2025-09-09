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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocket = initializeWebSocket;
exports.broadcast = broadcast;
exports.sendTo = sendTo;
exports.getClientCount = getClientCount;
exports.getClients = getClients;
// routes/websocket.ts
var express_1 = __importDefault(require("express"));
var ws_1 = require("ws");
var deviceServerManager_1 = require("../webscoketServer/deviceServerManager");
var websocketService_1 = require("../service/websocketService");
var tokenStore_1 = require("../db/tokenStore");
var uuid_1 = require("uuid");
var public_1 = require("../util/public");
var secret_1 = require("../ts/secret");
var router = express_1.default.Router();
// WebSocket 客户端管理
var clients = [];
var clientId = 0;
var wss = null;
// 初始化 WebSocket 服务器
function initializeWebSocket(server) {
    return __awaiter(this, void 0, void 0, function () {
        var heartbeat;
        var _this = this;
        return __generator(this, function (_a) {
            wss = new ws_1.WebSocketServer({ server: server });
            // 设置设备响应回调函数，用于广播设备消息给前端
            deviceServerManager_1.deviceServerManager.setDeviceStatusUpdateCallback(function (deviceResponse) {
                console.log("收到设备服务器消息，准备广播给前端:", deviceResponse);
                // 广播设备响应消息给所有前端客户端
                broadcast({
                    type: "device_update",
                    message: deviceResponse,
                    timestamp: Date.now(),
                });
            });
            wss.on("connection", function (ws) { return __awaiter(_this, void 0, void 0, function () {
                var tokenInfo, error_1, id, client;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            return [4 /*yield*/, deviceServerManager_1.deviceServerManager.initialize()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, tokenStore_1.tokenStore.getToken()];
                        case 2:
                            tokenInfo = _a.sent();
                            return [4 /*yield*/, deviceServerManager_1.deviceServerManager.performHandshake({
                                    action: "userOnline",
                                    version: 8,
                                    at: tokenInfo.at,
                                    userAgent: "app",
                                    apikey: tokenInfo.apiKey,
                                    appid: secret_1.secret.EWELINK_APP_APPID,
                                    nonce: (0, public_1.createNoce)(),
                                    sequence: String(Date.now()),
                                })];
                        case 3:
                            _a.sent();
                            console.log("设备服务器管理器初始化成功");
                            return [3 /*break*/, 5];
                        case 4:
                            error_1 = _a.sent();
                            console.error("设备服务器管理器初始化失败:", error_1);
                            return [3 /*break*/, 5];
                        case 5:
                            id = ++clientId;
                            client = { id: id, ws: ws, isAlive: true };
                            clients.push(client);
                            console.log("WebSocket \u5BA2\u6237\u7AEF ".concat(id, " \u5DF2\u8FDE\u63A5\uFF0C\u5F53\u524D\u8FDE\u63A5\u6570: ").concat(clients.length));
                            // 发送欢迎消息
                            ws.send(JSON.stringify({
                                type: "welcome",
                                message: "WebSocket 连接已建立",
                                id: id,
                                timestamp: Date.now(),
                            }));
                            // 处理消息
                            ws.on("message", function (data) { return __awaiter(_this, void 0, void 0, function () {
                                var message, _a, error_2;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 7, , 8]);
                                            message = JSON.parse(data.toString());
                                            console.log("\u6536\u5230\u6765\u81EA\u5BA2\u6237\u7AEF ".concat(id, " \u7684\u6D88\u606F:"), message);
                                            _a = message.type;
                                            switch (_a) {
                                                case "ping": return [3 /*break*/, 1];
                                                case "broadcast": return [3 /*break*/, 2];
                                                case "device_control": return [3 /*break*/, 3];
                                            }
                                            return [3 /*break*/, 5];
                                        case 1:
                                            // 心跳响应
                                            ws.send(JSON.stringify({
                                                type: "pong",
                                                timestamp: Date.now(),
                                            }));
                                            return [3 /*break*/, 6];
                                        case 2:
                                            // 广播消息给所有客户端
                                            broadcast({
                                                type: "broadcast",
                                                from: id,
                                                message: message.message,
                                                timestamp: Date.now(),
                                            });
                                            return [3 /*break*/, 6];
                                        case 3: 
                                        // 处理设备控制消息
                                        return [4 /*yield*/, handleDeviceControl(message, id, ws)];
                                        case 4:
                                            // 处理设备控制消息
                                            _b.sent();
                                            return [3 /*break*/, 6];
                                        case 5:
                                            // 默认回显消息
                                            ws.send(JSON.stringify({
                                                type: "echo",
                                                originalMessage: message,
                                                timestamp: Date.now(),
                                            }));
                                            _b.label = 6;
                                        case 6: return [3 /*break*/, 8];
                                        case 7:
                                            error_2 = _b.sent();
                                            console.error("解析消息失败:", error_2);
                                            ws.send(JSON.stringify({
                                                type: "error",
                                                message: "消息格式错误",
                                                timestamp: Date.now(),
                                            }));
                                            return [3 /*break*/, 8];
                                        case 8: return [2 /*return*/];
                                    }
                                });
                            }); });
                            // 处理连接关闭
                            ws.on("close", function () {
                                var idx = clients.findIndex(function (c) { return c.id === id; });
                                if (idx >= 0) {
                                    clients.splice(idx, 1);
                                    console.log("WebSocket \u5BA2\u6237\u7AEF ".concat(id, " \u5DF2\u65AD\u5F00\uFF0C\u5F53\u524D\u8FDE\u63A5\u6570: ").concat(clients.length));
                                }
                                clearInterval(heartbeat);
                                deviceServerManager_1.deviceServerManager.disconnect(); // 断开设备服务器连接
                            });
                            // 处理错误
                            ws.on("error", function (error) {
                                console.error("WebSocket \u5BA2\u6237\u7AEF ".concat(id, " \u9519\u8BEF:"), error);
                                var idx = clients.findIndex(function (c) { return c.id === id; });
                                if (idx >= 0) {
                                    clients.splice(idx, 1);
                                }
                            });
                            // 设置心跳检测
                            ws.on("pong", function () {
                                var client = clients.find(function (c) { return c.id === id; });
                                if (client) {
                                    client.isAlive = true;
                                }
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
            heartbeat = setInterval(function () {
                clients.forEach(function (client) {
                    if (client.isAlive === false) {
                        console.log("\u7EC8\u6B62\u65E0\u54CD\u5E94\u7684\u5BA2\u6237\u7AEF ".concat(client.id));
                        client.ws.terminate();
                        var idx = clients.findIndex(function (c) { return c.id === client.id; });
                        if (idx >= 0) {
                            clients.splice(idx, 1);
                        }
                        return;
                    }
                    client.isAlive = false;
                    client.ws.ping();
                });
            }, 30000);
            return [2 /*return*/];
        });
    });
}
// 处理设备控制消息
function handleDeviceControl(message, clientId, ws) {
    return __awaiter(this, void 0, void 0, function () {
        var response, clientMessage, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // 先判断 message.message 是否为对象且包含 deviceid
                    if (typeof message.message !== "object" ||
                        !message.message ||
                        !("deviceid" in message.message)) {
                        ws.send(JSON.stringify({
                            type: "error",
                            message: "设备控制消息缺少必要参数",
                            timestamp: Date.now(),
                        }));
                        return [2 /*return*/];
                    }
                    // 检查设备服务器连接状态
                    if (!deviceServerManager_1.deviceServerManager.isConnected()) {
                        ws.send(JSON.stringify({
                            type: "error",
                            message: "设备服务器未连接",
                            timestamp: Date.now(),
                        }));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, deviceServerManager_1.deviceServerManager.sendDeviceControl(message.message)];
                case 1:
                    response = _a.sent();
                    clientMessage = {
                        type: "device_response",
                        message: response,
                        timestamp: Date.now(),
                    };
                    // 如果是同步设备的状态变更，在这里判断设备状态改变是否成功，成功则上报设备状态更新
                    // ....
                    ws.send(JSON.stringify(clientMessage));
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error("设备控制处理失败:", error_3);
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "\u8BBE\u5907\u63A7\u5236\u5931\u8D25: ".concat(error_3 instanceof Error ? error_3.message : "未知错误"),
                        timestamp: Date.now(),
                    }));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// 广播消息给所有客户端
function broadcast(data) {
    var message = JSON.stringify(data);
    clients.forEach(function (client) {
        if (client.ws.readyState === ws_1.WebSocket.OPEN) {
            client.ws.send(message);
        }
    });
}
// 发送消息给特定客户端
function sendTo(predicate, data) {
    var message = JSON.stringify(data);
    clients.filter(predicate).forEach(function (client) {
        if (client.ws.readyState === ws_1.WebSocket.OPEN) {
            client.ws.send(message);
        }
    });
}
// 获取客户端数量
function getClientCount() {
    return clients.length;
}
// 获取所有客户端信息
function getClients() {
    return clients.map(function (_a) {
        var id = _a.id, isAlive = _a.isAlive;
        return ({ id: id, isAlive: isAlive });
    });
}
// HTTP 路由用于管理 WebSocket
router.get("/status", function (req, res) {
    res.json({
        connected: clients.length,
        clients: getClients(),
        deviceServerConnected: deviceServerManager_1.deviceServerManager.isConnected(),
        timestamp: Date.now(),
    });
});
// 通过 HTTP 发送广播消息
router.post("/broadcast", express_1.default.json(), function (req, res) {
    var _a;
    var payload = (_a = req.body) !== null && _a !== void 0 ? _a : {};
    broadcast({
        type: "http_broadcast",
        message: payload,
        timestamp: Date.now(),
    });
    res.json({
        sent: clients.length,
        message: "广播消息已发送",
    });
});
// 通过 HTTP 发送设备控制指令
router.post("/device-control", express_1.default.json(), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            if (!deviceServerManager_1.deviceServerManager.isConnected()) {
                return [2 /*return*/, res.status(503).json({
                        error: "设备服务器未连接",
                    })];
            }
            (0, websocketService_1.controlService)(req.body);
            res.json({
                event: {
                    header: {
                        name: "Response",
                        message_id: (0, uuid_1.v4)(),
                        version: "2",
                    },
                    payload: {},
                },
            });
        }
        catch (error) {
            res.status(500).json({
                error: "\u8BBE\u5907\u63A7\u5236\u5931\u8D25: ".concat(error instanceof Error ? error.message : "未知错误"),
            });
        }
        return [2 /*return*/];
    });
}); });
// 发送消息给特定客户端
router.post("/send", express_1.default.json(), function (req, res) {
    var _a = req.body, clientId = _a.clientId, message = _a.message;
    if (!clientId || !message) {
        return res.status(400).json({
            error: "缺少 clientId 或 message 参数",
        });
    }
    sendTo(function (client) { return client.id === clientId; }, {
        type: "http_message",
        message: message,
        timestamp: Date.now(),
    });
    res.json({
        sent: true,
        message: "\u6D88\u606F\u5DF2\u53D1\u9001\u7ED9\u5BA2\u6237\u7AEF ".concat(clientId),
    });
});
exports.default = router;
