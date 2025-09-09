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
exports.get = get;
exports.post = post;
exports.put = put;
exports.del = del;
exports.patch = patch;
var axios_1 = __importDefault(require("axios"));
var aiBridgeTokenStore_1 = require("../db/aiBridgeTokenStore");
var env_1 = require("../ts/env");
// 创建 axios 实例
var http = axios_1.default.create({
    baseURL: "http://".concat(env_1.env.IHOST_OPENAPI_ADDRESS, "/open-api/v2/rest"),
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});
// 请求拦截器
http.interceptors.request.use(function (config) { return __awaiter(void 0, void 0, void 0, function () {
    var localBridgeToken;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, aiBridgeTokenStore_1.aiBridgeTokenStore.getToken()];
            case 1:
                localBridgeToken = _a.sent();
                if (localBridgeToken && localBridgeToken.access_token) {
                    config.headers.Authorization = "Bearer ".concat(localBridgeToken.access_token);
                }
                // console.log(
                //   `发送请求: ${config.method?.toUpperCase()} ${JSON.stringify(config)}`
                // );
                return [2 /*return*/, config];
        }
    });
}); }, function (error) {
    // 对请求错误做些什么
    console.error("请求错误:", error);
    return Promise.reject(error);
});
// 响应拦截器
http.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    console.log("\u6536\u5230\u54CD\u5E94: ".concat(response.status, ")}"));
    // 根据后端约定处理响应
    // if (response.data && response.data.error === 0) {
    //   return response.data;
    // } else if (response.data && response.data.error !== 0) {
    //   // 业务错误
    //   const errorMsg = response.data.msg || "业务错误";
    //   return Promise.reject(new Error(errorMsg));
    // }
    return response.data;
}, function (error) {
    // 对响应错误做点什么
    console.error("响应错误:", error);
    var errData = error;
    if (error.response) {
        // 请求成功发出且服务器也响应了状态码，但状态码超出了 2xx 的范围
        switch (error.response.status) {
            case 401:
                errData = "未授权，请重新登录";
                break;
            case 403:
                errData = "拒绝访问";
                break;
            case 404:
                errData = "请求资源不存在";
                break;
            case 500:
                errData = "服务器内部错误";
                break;
            default:
                errData = "\u8FDE\u63A5\u9519\u8BEF".concat(error.response.status);
        }
        console.error("错误内容:", errData);
    }
    else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        //   message.error("网络异常，请检查网络连接");
    }
    else {
        // 发送请求时出了点问题
        //   message.error("请求错误，请重试");
    }
    return Promise.reject(error);
});
// 封装通用方法
function get(url, params, config) {
    if (params === void 0) { params = {}; }
    if (config === void 0) { config = {}; }
    return http.get(url, __assign({ params: params }, config));
}
function post(url_1) {
    return __awaiter(this, arguments, void 0, function (url, data, config) {
        if (data === void 0) { data = {}; }
        if (config === void 0) { config = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, http.post(url, data, config)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function put(url, data, config) {
    if (data === void 0) { data = {}; }
    if (config === void 0) { config = {}; }
    return http.put(url, data, config);
}
function del(url, config) {
    if (config === void 0) { config = {}; }
    return http.delete(url, config);
}
function patch(url, data, config) {
    if (data === void 0) { data = {}; }
    if (config === void 0) { config = {}; }
    return http.patch(url, data, config);
}
