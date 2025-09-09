"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transfromStatusStructure = exports.AIBridgeToken = exports.ewelinkToken = void 0;
var EThermostatMode_1 = __importDefault(require("../ts/enum/EThermostatMode"));
var ewelinkToken = function (data) {
    var at = data.at, rt = data.rt, apikey = data.apikey;
};
exports.ewelinkToken = ewelinkToken;
var AIBridgeToken = function (data) { };
exports.AIBridgeToken = AIBridgeToken;
/**
 * @description 参数结构转换
 * @param status
 * @returns object
 */
var transfromStatusStructure = function (status) {
    if (status.workMode) {
        var mode = EThermostatMode_1.default[status.workMode];
        return {
            thermostat: {
                "thermostat-mode": {
                    thermostatMode: mode,
                },
            },
        };
    }
};
exports.transfromStatusStructure = transfromStatusStructure;
