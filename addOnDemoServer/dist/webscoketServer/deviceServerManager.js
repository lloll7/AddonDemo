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
exports.deviceServerManager = exports.DeviceServerManager = void 0;
var deviceWsServer_1 = require("./deviceWsServer");
var axios_1 = __importDefault(require("axios"));
var DeviceServerManager = /** @class */ (function () {
    function DeviceServerManager() {
        this.deviceServer = null;
        this.isInitialized = false;
        this.deviceStatusUpdateCallback = null; // 设备响应回调函数
    }
    DeviceServerManager.getInstance = function () {
        if (!DeviceServerManager.instance) {
            DeviceServerManager.instance = new DeviceServerManager();
        }
        return DeviceServerManager.instance;
    };
    // 设置设备响应回调函数
    DeviceServerManager.prototype.setDeviceStatusUpdateCallback = function (callback) {
        this.deviceStatusUpdateCallback = callback;
        // 如果设备服务器已经初始化，立即设置回调
        if (this.deviceServer) {
            this.deviceServer.setDeviceStatusUpdateCallback(callback);
        }
    };
    // 初始化设备服务器连接
    DeviceServerManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isInitialized) {
                            console.log("设备服务器管理器已经初始化");
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.get("https://".concat(process.env.DISPATCH_WEBSOCKET_ADDRESS, "/dispatch/app"))];
                    case 2:
                        res = _a.sent();
                        console.log("获取到设备服务器地址:", res.data.IP);
                        // 创建设备服务器客户端
                        this.deviceServer = new deviceWsServer_1.DeviceServerClient("wss://".concat(res.data.IP, "/api/ws"), {
                            rejectUnauthorized: false,
                            maxReconnectAttempts: 5,
                            reconnectInterval: 1000,
                        });
                        // 设置设备响应回调函数
                        if (this.deviceStatusUpdateCallback) {
                            this.deviceServer.setDeviceStatusUpdateCallback(this.deviceStatusUpdateCallback);
                        }
                        // 连接到设备服务器
                        return [4 /*yield*/, this.deviceServer.connect()];
                    case 3:
                        // 连接到设备服务器
                        _a.sent();
                        this.isInitialized = true;
                        console.log("设备服务器管理器初始化成功");
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("设备服务器管理器初始化失败:", error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // 获取设备服务器实例
    DeviceServerManager.prototype.getDeviceServer = function () {
        return this.deviceServer;
    };
    // 检查设备服务器是否已连接
    DeviceServerManager.prototype.isConnected = function () {
        var _a;
        return ((_a = this.deviceServer) === null || _a === void 0 ? void 0 : _a.connected) || false;
    };
    // 执行握手
    DeviceServerManager.prototype.performHandshake = function (handshakeMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.deviceServer) {
                            throw new Error("设备服务器未初始化");
                        }
                        if (!this.deviceServer.connected) {
                            throw new Error("设备服务器未连接");
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.deviceServer.handShake(handshakeMessage)];
                    case 2:
                        response = _a.sent();
                        console.log("握手成功:", response);
                        return [2 /*return*/, response];
                    case 3:
                        error_2 = _a.sent();
                        console.error("握手失败:", error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // 发送设备控制指令
    DeviceServerManager.prototype.sendDeviceControl = function (controlMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.deviceServer) {
                            throw new Error("设备服务器未初始化");
                        }
                        if (!this.deviceServer.connected) {
                            throw new Error("设备服务器未连接");
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.deviceServer.sendDeviceControl(controlMessage)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 3:
                        error_3 = _a.sent();
                        console.error("设备控制失败:", error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // 断开连接
    DeviceServerManager.prototype.disconnect = function () {
        if (this.deviceServer) {
            this.deviceServer.disconnect();
            this.deviceServer = null;
        }
        this.isInitialized = false;
    };
    return DeviceServerManager;
}());
exports.DeviceServerManager = DeviceServerManager;
// 导出单例实例
exports.deviceServerManager = DeviceServerManager.getInstance();
