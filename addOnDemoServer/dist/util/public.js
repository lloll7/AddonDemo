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
exports.createNoce = createNoce;
exports.createCommonHeader = createCommonHeader;
exports.beforeLoginRequest = beforeLoginRequest;
exports.afterLoginRequest = afterLoginRequest;
var axios_1 = __importDefault(require("axios"));
var api_1 = require("./api");
var EReqMethod_1 = __importDefault(require("../ts/enum/EReqMethod"));
// import { apiUrl } from "@/config";
// import { useDisconnect } from "@/hooks/useDisconnect";
// 初始化axios设置
axios_1.default.defaults.baseURL = process.env.IHOST_OPENAPI_ADDRESS;
axios_1.default.defaults.timeout = 60000;
// 生成随机数
var chars = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
];
function createNoce() {
    var result = "";
    for (var i = 0; i < 8; i++) {
        var num = Math.ceil(Math.random() * (chars.length - 1));
        result += chars[num];
    }
    return result;
}
function createCommonHeader(type, params, at) {
    var auth = at ? "Bearer ".concat(at) : "";
    return {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        Nonce: createNoce(),
        Authorization: auth,
    };
}
function beforeLoginRequest(url, params, methodType) {
    return _httpGetPOSTPutDeleteRequest(url, params, methodType);
}
function afterLoginRequest(url, params, methodType, cancelToken) {
    return __awaiter(this, void 0, void 0, function () {
        var at;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, api_1.getAt)()];
                case 1:
                    at = _a.sent();
                    if (!at) {
                        console.warn("\u8C03\u7528\u6B64\u63A5\u53E3(".concat(url, ")\uFF0C\u5FC5\u987B\u5148\u767B\u5F55 \u6216\u8005 \u767B\u5F55\u624D\u80FD\u83B7\u53D6\u5B8C\u6574\u6570\u636E!"));
                    }
                    return [2 /*return*/, _httpGetPOSTPutDeleteRequest(url, params, methodType, at, cancelToken)];
            }
        });
    });
}
function _httpGetPOSTPutDeleteRequest(url_1, params_1, methodType_1) {
    return __awaiter(this, arguments, void 0, function (url, params, methodType, at, cancelToken) {
        var headers, axiosConfig, result, error_1, errorStr, msg;
        if (at === void 0) { at = null; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    headers = createCommonHeader(methodType, params, at);
                    axiosConfig = {
                        url: url,
                        method: methodType,
                        headers: headers,
                        params: params,
                        cancelToken: cancelToken,
                    };
                    if (methodType === EReqMethod_1.default.POST ||
                        methodType === EReqMethod_1.default.PUT ||
                        methodType === EReqMethod_1.default.DELETE ||
                        methodType === EReqMethod_1.default.OPTIONS) {
                        delete axiosConfig.params;
                        axiosConfig["data"] = params;
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, axios_1.default)(axiosConfig)];
                case 2:
                    result = _a.sent();
                    // const { data, status } = result;
                    // console.log(`http请求结束 url:${url}`, `method:${methodType}`, 'params:', params);
                    return [2 /*return*/, result ? result.data : {}];
                case 3:
                    error_1 = _a.sent();
                    errorStr = JSON.stringify(error_1);
                    if (errorStr.includes("Network Error") || errorStr.includes("code 502")) {
                        // etcStore.setIsLoading(true)
                        // window.location.reload();
                        //   useDisconnect().startReconnect();
                    }
                    else {
                        //   etcStore.setIsLoading(false);
                    }
                    if (axios_1.default.isAxiosError(error_1)) {
                        console.log("http request axios error: ", error_1.code, error_1.message);
                        msg = error_1.message.includes("timeout") ? "timeout" : error_1.message;
                        return [2 /*return*/, {
                                error: 500,
                                msg: msg,
                            }];
                    }
                    console.log("http request unknown error: ", error_1);
                    return [2 /*return*/, {
                            error: 500,
                            msg: "http api module unknown error",
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
