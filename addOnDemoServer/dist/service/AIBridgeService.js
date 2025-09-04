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
exports.accessTokenService = accessTokenService;
exports.devicesSerivce = devicesSerivce;
exports.discoveryRequestService = discoveryRequestService;
exports.deviceStatesChangeReport = deviceStatesChangeReport;
exports.deviceOnlineStatesChangeReport = deviceOnlineStatesChangeReport;
var aiBridgeTokenStore_1 = require("../db/aiBridgeTokenStore");
var AIBridgeHttp_1 = require("../util/AIBridgeHttp");
var deviceStore_1 = require("../db/deviceStore");
var EThermostatMode_1 = __importDefault(require("../ts/enum/EThermostatMode"));
var tool_1 = require("../util/tool");
var uuid_1 = require("uuid");
function accessTokenService() {
    return __awaiter(this, void 0, void 0, function () {
        var params, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = {
                        app_name: "app",
                    };
                    console.log(params, "AIBridgeParams");
                    return [4 /*yield*/, (0, AIBridgeHttp_1.get)("/bridge/access_token", params)];
                case 1:
                    result = _a.sent();
                    // 兼容不同返回结构，假设 { access_token, expires_in }
                    if (result.error === 0) {
                        console.log(result, "result");
                        aiBridgeTokenStore_1.aiBridgeTokenStore.saveToken(result.data.token);
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
// 筛选处理网关子设备列表返回的信息
function devicesSerivce() {
    return __awaiter(this, arguments, void 0, function (id) {
        var result, serialNumbers;
        if (id === void 0) { id = null; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(id, "单设备id");
                    return [4 /*yield*/, (0, AIBridgeHttp_1.get)("/devices")];
                case 1:
                    result = _a.sent();
                    serialNumbers = result.data.device_list
                        .filter(function (item) { return !!item.third_serial_number; })
                        .map(function (item) { return ({
                        serial_number: item.serial_number,
                        third_serial_number: item.third_serial_number,
                    }); });
                    // 如果传入了id，则只返回对应id的设备（设备id与third_serial_number一致）
                    if (id) {
                        serialNumbers = serialNumbers.filter(function (item) { return item.third_serial_number === id; });
                        console.log(serialNumbers, "serialNumbers");
                    }
                    return [2 /*return*/, serialNumbers];
            }
        });
    });
}
function discoveryRequestService(body) {
    return __awaiter(this, void 0, void 0, function () {
        var deviceId, deviceInfo, deviceid, name, params, extra, paramsObj, extraObj, modeArr, postParams, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(body, "body");
                    deviceId = body.deviceId;
                    return [4 /*yield*/, deviceStore_1.deviceStore.getDevice(deviceId)];
                case 1:
                    deviceInfo = _a.sent();
                    console.log(deviceInfo, "deviceInfo");
                    deviceid = deviceInfo.deviceid, name = deviceInfo.name, params = deviceInfo.params, extra = deviceInfo.extra;
                    console.log(deviceid, "deviceiddeviceiddeviceid");
                    paramsObj = JSON.parse(params);
                    extraObj = JSON.parse(extra);
                    modeArr = ["MANUAL", "ECO", "AUTO"];
                    console.log(paramsObj, "params");
                    postParams = {
                        event: {
                            header: {
                                name: "DiscoveryRequest",
                                message_id: (0, uuid_1.v4)(),
                                version: "2",
                            },
                            payload: {
                                endpoints: [
                                    {
                                        third_serial_number: deviceid,
                                        name: name,
                                        display_category: "thermostat",
                                        capabilities: [
                                            {
                                                capability: "thermostat",
                                                permission: "1100",
                                                name: "thermostat-mode",
                                                settings: {
                                                    supportedModes: {
                                                        permission: "11",
                                                        type: "enum",
                                                        values: modeArr,
                                                        value: "MANUAL",
                                                    },
                                                },
                                            },
                                            {
                                                capability: "child-lock",
                                                permission: "1100",
                                            },
                                        ],
                                        state: {
                                            "child-lock": {
                                                powerState: paramsObj.childLock ? "on" : "off",
                                            },
                                            thermostat: {
                                                "thermostat-mode": {
                                                    thermostatMode: EThermostatMode_1.default[paramsObj.workMode],
                                                },
                                            },
                                        },
                                        manufacturer: extraObj.manufacturer,
                                        model: extraObj.model,
                                        firmware_version: paramsObj.fwVersion,
                                        service_address: "http://10.10.10.185:3000/ws/device-control",
                                    },
                                ],
                            },
                        },
                    };
                    console.log(postParams.event.payload.endpoints[0].third_serial_number, "[0].third_serial_number");
                    return [4 /*yield*/, (0, AIBridgeHttp_1.post)("/thirdparty/event", postParams)];
                case 2:
                    result = _a.sent();
                    console.log(JSON.stringify(result), "同步设备返回结果");
                    return [2 /*return*/, result];
            }
        });
    });
}
function deviceStatesChangeReport(body) {
    return __awaiter(this, void 0, void 0, function () {
        var status, serialNumbers, params, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    status = (0, tool_1.transfromStatusStructure)(body.status);
                    return [4 /*yield*/, devicesSerivce(body.status.deviceId)];
                case 1:
                    serialNumbers = _a.sent();
                    params = {
                        event: {
                            header: {
                                name: "DeviceStatesChangeReport",
                                message_id: (0, uuid_1.v4)(),
                                version: "2",
                            },
                            endpoint: serialNumbers[0],
                            payload: {
                                state: status,
                            },
                        },
                    };
                    return [4 /*yield*/, (0, AIBridgeHttp_1.post)("/thirdparty/event", params)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
function deviceOnlineStatesChangeReport(body) {
    return __awaiter(this, void 0, void 0, function () {
        var serialNumbers, params, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(body, "设备上下线更新上报");
                    return [4 /*yield*/, devicesSerivce(body.status.deviceId)];
                case 1:
                    serialNumbers = _a.sent();
                    params = {
                        event: {
                            header: {
                                name: "DeviceOnlineChangeReport",
                                message_id: (0, uuid_1.v4)(),
                                version: "2",
                            },
                            endpoint: serialNumbers[0],
                            payload: {
                                online: body.status.online,
                                // online: false,
                            },
                        },
                    };
                    console.log(params, "设备上下限params");
                    return [4 /*yield*/, (0, AIBridgeHttp_1.post)("/thirdparty/event", params)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
