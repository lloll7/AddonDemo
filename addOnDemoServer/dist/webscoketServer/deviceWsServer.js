"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.DeviceServerClient = void 0;
// service/deviceWsServer.ts
var ws_1 = require("ws");
var https_1 = __importDefault(require("https"));
var AIBridgeService_1 = require("../service/AIBridgeService");
// 设备服务器 WebSocket 客户端类
var DeviceServerClient = /** @class */ (function () {
    // 构造函数，初始化服务器地址和选项
    function DeviceServerClient(serverUrl, options) {
        if (options === void 0) { options = {}; }
        this.ws = null; // WebSocket 实例
        this.reconnectAttempts = 0; // 当前重连次数
        this.maxReconnectAttempts = 5; // 最大重连次数
        this.heartbeatTimer = null; // 心跳定时器
        this.isConnected = false; // 连接状态
        this.isHandShaked = false; // 添加握手状态
        this.pingTimer = null;
        this.handShakeTimer = null;
        this.handShakeResolve = null; // 添加握手resolve回调
        this.deviceStatusUpdateCallback = null; // 设备状态更新回调函数
        this.serverUrl = serverUrl;
        this.options = __assign({ rejectUnauthorized: false, maxReconnectAttempts: 5, reconnectInterval: 1000 }, options);
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = this.options.maxReconnectAttempts || 5;
    }
    // 设置设备响应回调函数
    DeviceServerClient.prototype.setDeviceStatusUpdateCallback = function (callback) {
        this.deviceStatusUpdateCallback = callback;
    };
    // 建立 WebSocket 连接
    DeviceServerClient.prototype.connect = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                // 创建WebSocket连接选项
                var wsOptions = {};
                // 如果是WSS连接，添加SSL选项
                if (_this.serverUrl.startsWith("wss://")) {
                    var agentOptions = {
                        rejectUnauthorized: _this.options.rejectUnauthorized,
                    };
                    // 只有在明确指定时才添加版本选项
                    if (_this.options.minVersion) {
                        agentOptions.minVersion = _this.options.minVersion;
                    }
                    if (_this.options.maxVersion) {
                        agentOptions.maxVersion = _this.options.maxVersion;
                    }
                    // 如果提供了证书相关选项
                    if (_this.options.ca) {
                        agentOptions.ca = _this.options.ca;
                    }
                    if (_this.options.cert) {
                        agentOptions.cert = _this.options.cert;
                    }
                    if (_this.options.key) {
                        agentOptions.key = _this.options.key;
                    }
                    if (_this.options.passphrase) {
                        agentOptions.passphrase = _this.options.passphrase;
                    }
                    wsOptions.agent = new https_1.default.Agent(agentOptions);
                }
                // 创建 WebSocket 实例
                _this.ws = new ws_1.WebSocket(_this.serverUrl, wsOptions);
                console.log("正在连接设备服务器...");
                // 连接成功回调
                _this.ws.onopen = function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        console.log("设备服务器连接成功");
                        this.isConnected = true;
                        this.reconnectAttempts = 0; // 重置重连次数
                        //   const tokenInfo = await tokenStore.getToken();
                        //   //   console.log(tokenInfo, "tokenInfo");
                        //   if (tokenInfo && tokenInfo.at) {
                        //     await this.handShake({
                        //       action: "userOnline",
                        //       version: 8,
                        //       at: tokenInfo.at,
                        //       userAgent: "app",
                        //       apikey: tokenInfo.apiKey,
                        //       appid: process.env.EWELINK_APP_APPID,
                        //       nonce: createNoce(),
                        //       sequence: String(Date.now()),
                        //     });
                        //   }
                        //   this.startHeartbeat(); // 启动心跳
                        resolve();
                        return [2 /*return*/];
                    });
                }); };
                // 收到消息回调
                _this.ws.onmessage = function (event) {
                    try {
                        var data = event.data;
                        console.log("收到设备服务器消息:", data);
                        _this.handleMessage(data); // 处理消息
                    }
                    catch (error) {
                        console.error("解析设备服务器消息失败:", error);
                    }
                };
                // 连接关闭回调
                _this.ws.onclose = function (event) {
                    console.log("设备服务器连接关闭:", event.code, event.reason);
                    _this.isConnected = false;
                    _this.isHandShaked = false; // 重置握手状态
                    _this.stopHeartbeat(); // 停止心跳
                    _this.attemptReconnect(); // 尝试重连
                };
                // 连接错误回调
                _this.ws.onerror = function (error) {
                    console.error("设备服务器连接错误:", error);
                    reject(error);
                };
            }
            catch (error) {
                reject(error);
            }
        });
    };
    // 处理收到的消息
    DeviceServerClient.prototype.handleMessage = function (data) {
        try {
            // 如果是字符串则解析为对象
            var parsedData = typeof data === "string"
                ? data === "pong"
                    ? data
                    : JSON.parse(data)
                : data;
            if (parsedData === "pong") {
                this.handlePong();
            }
            // 检查是否为握手响应
            if (parsedData.error !== undefined &&
                parsedData.apikey &&
                parsedData.config &&
                this.handShakeResolve) {
                this.handleHandShake(parsedData);
            }
            console.log("收到设备服务器响应:", parsedData.action, parsedData);
            // 判断是否为设备响应消息（含 error 字段）
            if (parsedData.error !== undefined) {
                // 这是一个设备响应消息
                this.handleDeviceResponse(parsedData);
            }
            // 设备更新消息
            if (parsedData.action && parsedData.action === "update") {
                this.handleDeviceStatusUpdate(parsedData);
            }
            if (parsedData.action && parsedData.action === "sysmsg") {
                console.log("进入离线if");
                this.handleDeviceOnlineStatusChange(parsedData);
            }
        }
        catch (error) {
            console.error("处理设备服务器消息失败:", error);
        }
    };
    // 处理设备响应消息（可扩展业务逻辑）
    DeviceServerClient.prototype.handleDeviceResponse = function (response) {
        console.log("设备响应:", response);
    };
    // 处理设备状态更新推送消息
    DeviceServerClient.prototype.handleDeviceStatusUpdate = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(response, "设备服务器更新设备消息");
                        params = {
                            status: __assign({ deviceId: response.deviceid }, response.params),
                        };
                        // const params2 = {
                        //   status: {
                        //     deviceId: response.deviceid,
                        //     online: false,
                        //   },
                        // };
                        return [4 /*yield*/, (0, AIBridgeService_1.deviceStatesChangeReport)(params)];
                    case 1:
                        // const params2 = {
                        //   status: {
                        //     deviceId: response.deviceid,
                        //     online: false,
                        //   },
                        // };
                        _a.sent();
                        // const res = await deviceOnlineStatesChangeReport(params2);
                        // 这里可以添加响应处理逻辑
                        if (this.deviceStatusUpdateCallback) {
                            this.deviceStatusUpdateCallback(response);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    DeviceServerClient.prototype.handleDeviceOnlineStatusChange = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var params, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 设备上下线
                        console.log(response, "设备服务器更新设备上下线");
                        params = {
                            status: {
                                deviceId: response.deviceid,
                                online: response.params.online,
                            },
                        };
                        return [4 /*yield*/, (0, AIBridgeService_1.deviceOnlineStatesChangeReport)(params)];
                    case 1:
                        res = _a.sent();
                        console.log(res, "设备上下线上报结果");
                        if (this.deviceStatusUpdateCallback) {
                            console.log("进入deviceStatusUpdateCallback if");
                            this.deviceStatusUpdateCallback(response);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // 收到pong响应时的回调
    DeviceServerClient.prototype.handlePong = function () {
        clearTimeout(this.pingTimer);
        this.pingTimer = null;
    };
    DeviceServerClient.prototype.handleHandShake = function (parsedData) {
        console.log("进入握手handler");
        clearTimeout(this.handShakeTimer);
        this.handShakeTimer = null;
        this.isHandShaked = true; // 设置握手状态
        this.handShakeResolve(parsedData);
        this.handShakeResolve = null; // 清除回调
        this.startHeartbeat(
        //   2000
        parsedData.config.hbInterval
            ? parsedData.config.hbInterval * 1000 * (0.8 + 0.2 * Math.random())
            : 90000);
        return;
    };
    // 发送设备控制指令，返回 Promise
    DeviceServerClient.prototype.sendDeviceControl = function (controlInfo) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // 检查连接状态
            if (!_this.isConnected) {
                reject(new Error("设备服务器未连接"));
                return;
            }
            // 检查是否已完成握手
            if (!_this.isHandShaked) {
                reject(new Error("设备服务器未完成握手"));
                return;
            }
            try {
                console.log(controlInfo, "controlInfo");
                console.log(JSON.stringify(controlInfo), "JSON.stringify(controlInfo)");
                // 发送控制指令
                _this.ws.send(JSON.stringify(controlInfo));
            }
            catch (error) {
                reject(error);
            }
        });
    };
    // 启动心跳定时器，定期发送 ping 消息
    DeviceServerClient.prototype.startHeartbeat = function (hbInterval) {
        var _this = this;
        this.heartbeatTimer = setInterval(function () {
            if (_this.isConnected && _this.ws) {
                // 发送心跳 ping
                _this.ws.send("ping");
                _this.pingTimer = setTimeout(function () {
                    console.log("pingTimer");
                    _this.disconnect();
                    _this.attemptReconnect();
                }, 5000);
            }
        }, hbInterval);
    };
    // 停止心跳定时器
    DeviceServerClient.prototype.stopHeartbeat = function () {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    };
    // 添加握手方法
    DeviceServerClient.prototype.handShake = function (hsMess) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (!_this.isConnected) {
                            reject(new Error("设备服务器未连接"));
                            return;
                        }
                        // 设置超时
                        _this.handShakeTimer = setTimeout(function () {
                            _this.handShakeResolve = null; // 清除回调
                            reject(new Error("握手超时"));
                        }, 10000); // 10秒超时
                        // 保存resolve回调
                        _this.handShakeResolve = resolve;
                        try {
                            var handShakeMessage = hsMess;
                            console.log("发送握手消息:", handShakeMessage);
                            _this.ws.send(JSON.stringify(handShakeMessage));
                        }
                        catch (error) {
                            _this.handShakeResolve = null; // 清除回调
                            clearTimeout(_this.handShakeTimer);
                            _this.handShakeTimer = null;
                            reject(error);
                        }
                    })];
            });
        });
    };
    // 尝试重连设备服务器
    DeviceServerClient.prototype.attemptReconnect = function () {
        var _this = this;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log("\u5C1D\u8BD5\u91CD\u8FDE\u8BBE\u5907\u670D\u52A1\u5668 (".concat(this.reconnectAttempts, "/").concat(this.maxReconnectAttempts, ")"));
            // 按照重连次数递增延迟重连
            setTimeout(function () {
                _this.connect().catch(console.error);
            }, (this.options.reconnectInterval || 1000) * this.reconnectAttempts);
        }
        else {
            console.error("设备服务器重连次数已达上限");
        }
    };
    // 主动断开连接
    DeviceServerClient.prototype.disconnect = function () {
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            console.log("进入设备服务器disconnect if");
        }
        console.log("进入设备服务器disconnect else");
        this.isConnected = false;
    };
    Object.defineProperty(DeviceServerClient.prototype, "connected", {
        // 获取当前连接状态
        get: function () {
            return this.isConnected;
        },
        enumerable: false,
        configurable: true
    });
    return DeviceServerClient;
}());
exports.DeviceServerClient = DeviceServerClient;
