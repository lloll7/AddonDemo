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
exports.controlService = controlService;
var deviceServerManager_1 = require("../webscoketServer/deviceServerManager");
var tokenStore_1 = require("../db/tokenStore");
var EThermostatMode_1 = __importDefault(require("../ts/enum/EThermostatMode"));
var AIBridgeHttp_1 = require("../util/AIBridgeHttp");
var uuid_1 = require("uuid");
function controlService(body) {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, submitUpdateParams, lockStatus, contorlMessage, result, reportData, reportResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(body.directive.payload.state, "网关控制同步设备发送的控制参数");
                    return [4 /*yield*/, tokenStore_1.tokenStore.getToken()];
                case 1:
                    apiKey = (_a.sent()).apiKey;
                    submitUpdateParams = {};
                    if (body.directive.payload.state.thermostat &&
                        body.directive.payload.state.thermostat["thermostat-mode"]) {
                        submitUpdateParams.workMode =
                            EThermostatMode_1.default[body.directive.payload.state.thermostat["thermostat-mode"].thermostatMode];
                    }
                    if (body.directive.payload.state["child-lock"]) {
                        lockStatus = body.directive.payload.state["child-lock"].powerState === "on";
                        submitUpdateParams.childLock = lockStatus;
                    }
                    contorlMessage = {
                        action: "update",
                        apikey: apiKey,
                        deviceid: body.directive.endpoint.third_serial_number,
                        params: submitUpdateParams,
                        userAgent: "app",
                        sequence: JSON.stringify(Date.now()),
                    };
                    return [4 /*yield*/, deviceServerManager_1.deviceServerManager.sendDeviceControl(contorlMessage)];
                case 2:
                    result = _a.sent();
                    console.log(result, "网关控制result");
                    if (!(result.error === 0)) return [3 /*break*/, 4];
                    reportData = {
                        header: {
                            version: "2",
                            message_id: (0, uuid_1.v4)(),
                            name: "DeviceStatesChangeReport",
                        },
                        endpoint: {
                            serial_number: body.directive.endpoint.serial_number,
                            third_serial_number: body.directive.endpoint.third_serial_number,
                        },
                        payload: __assign({}, body.directive.payload),
                    };
                    return [4 /*yield*/, (0, AIBridgeHttp_1.post)("/thirdparty/event", reportData)];
                case 3:
                    reportResult = _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
