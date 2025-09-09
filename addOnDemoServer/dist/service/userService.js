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
exports.loginService = loginService;
var crypto_1 = __importDefault(require("crypto"));
var public_1 = require("../util/public");
var http_1 = require("../util/http");
var tokenStore_1 = require("../db/tokenStore");
var secret_1 = require("../ts/secret");
// 导入设备服务器管理器
var deviceServerManager_1 = require("../webscoketServer/deviceServerManager");
/**
 * @description 易微联账号登录
 * @param body
 * @returns
 */
function loginService(body) {
    return __awaiter(this, void 0, void 0, function () {
        var buffer, theSign, result, handShakeResult, error_1, returnToken;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    buffer = Buffer.from(JSON.stringify(body), "utf-8");
                    theSign = crypto_1.default
                        .createHmac("sha256", secret_1.secret.EWELINK_APP_APPSECRET)
                        .update(buffer)
                        .digest("base64");
                    return [4 /*yield*/, (0, http_1.post)("/user/login", JSON.stringify(body), {
                            headers: {
                                "X-CK-Appid": secret_1.secret.EWELINK_APP_APPID,
                                Authorization: "Sign ".concat(theSign),
                            },
                        })];
                case 1:
                    result = _a.sent();
                    if (!(result && result.data.at)) return [3 /*break*/, 8];
                    return [4 /*yield*/, tokenStore_1.tokenStore.setToken(result.data.at, result.data.rt, result.data.user.apikey, result.data.region, result.data.user.phoneNumber
                            ? result.data.user.phoneNumber
                            : result.data.user.email)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 7, , 8]);
                    if (!deviceServerManager_1.deviceServerManager.isConnected()) return [3 /*break*/, 5];
                    return [4 /*yield*/, deviceServerManager_1.deviceServerManager.performHandshake({
                            action: "userOnline",
                            version: 8,
                            at: result.data.at,
                            userAgent: "app",
                            apikey: result.data.user.apikey,
                            appid: secret_1.secret.EWELINK_APP_APPID,
                            nonce: (0, public_1.createNoce)(),
                            sequence: String(Date.now()),
                        })];
                case 4:
                    handShakeResult = _a.sent();
                    console.log("设备服务器握手成功:", handShakeResult);
                    return [3 /*break*/, 6];
                case 5:
                    console.log("设备服务器未连接，跳过握手");
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.log("握手失败", error_1);
                    return [3 /*break*/, 8];
                case 8:
                    returnToken = {
                        at: result.data.at,
                        rt: result.data.rt,
                        apiKey: result.data.user.apikey,
                        region: result.data.region,
                        account: result.data.user.phoneNumber
                            ? result.data.user.phoneNumber
                            : result.data.user.email,
                    };
                    return [2 /*return*/, returnToken];
            }
        });
    });
}
