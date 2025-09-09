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
var express_1 = __importDefault(require("express"));
var userService_1 = require("../service/userService");
var http_1 = require("../util/http");
var tokenStore_1 = require("../db/tokenStore");
var router = express_1.default.Router();
/* 登录 */
router.post("/login", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log(req.body, "登录请求");
                    return [4 /*yield*/, (0, userService_1.loginService)(req.body)];
                case 1:
                    result = _a.sent();
                    res.json(result);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("登录失败:", error_1);
                    res.status(500).json({ error: "登录失败", msg: error_1.message });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
});
/* 退出登录 */
router.delete("/logout", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, http_1.del)("/user/logout", {
                            headers: {
                                "X-CK-Appid": process.env.EWELINK_APP_APPID,
                            },
                        })];
                case 1:
                    result = _a.sent();
                    if (!(result.error === 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, tokenStore_1.tokenStore.clearToken()];
                case 2:
                    _a.sent();
                    res.json(result);
                    return [3 /*break*/, 4];
                case 3:
                    res.status(500).json({ error: result.error, msg: result.msg });
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    res.status(500).json({ error: "退出登录失败", msg: error_2.message });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
});
router.get("/token", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var tokenInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tokenStore_1.tokenStore.getToken()];
                case 1:
                    tokenInfo = _a.sent();
                    if (tokenInfo && tokenInfo.at) {
                        res.json(tokenInfo);
                    }
                    else {
                        res.json(null);
                    }
                    return [2 /*return*/];
            }
        });
    });
});
exports.default = router;
