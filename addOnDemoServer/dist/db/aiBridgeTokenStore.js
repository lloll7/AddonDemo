"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiBridgeTokenStore = void 0;
var sqlite3_1 = __importDefault(require("sqlite3"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var DB_PATH = path_1.default.join(__dirname, "../data/dataBase.db");
var AIBridgeTokenStore = /** @class */ (function () {
    function AIBridgeTokenStore() {
        this.initDatabase();
    }
    AIBridgeTokenStore.prototype.initDatabase = function () {
        var _this = this;
        var dataDir = path_1.default.dirname(DB_PATH);
        if (!fs_1.default.existsSync(dataDir)) {
            fs_1.default.mkdirSync(dataDir, { recursive: true });
        }
        this.db = new sqlite3_1.default.Database(DB_PATH, function (err) {
            if (err) {
                console.error("数据库连接失败:", err.message);
            }
            else {
                _this.initTable();
            }
        });
    };
    AIBridgeTokenStore.prototype.initTable = function () {
        var _a;
        var sql = "\n      CREATE TABLE IF NOT EXISTS bridge_tokens (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        access_token TEXT NOT NULL\n      )\n    ";
        (_a = this.db) === null || _a === void 0 ? void 0 : _a.run(sql, function (err) {
            if (err) {
                console.error("创建 bridge_tokens 表失败:", err.message);
            }
        });
    };
    AIBridgeTokenStore.prototype.saveToken = function (access_token) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.db) {
                reject(new Error("数据库未初始化"));
                return;
            }
            _this.db.serialize(function () {
                var _a;
                (_a = _this.db) === null || _a === void 0 ? void 0 : _a.run("DELETE FROM bridge_tokens", function (err) {
                    var _a;
                    if (err) {
                        reject(err);
                        return;
                    }
                    (_a = _this.db) === null || _a === void 0 ? void 0 : _a.run("INSERT INTO bridge_tokens (access_token) VALUES (?)", [access_token], function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            });
        });
    };
    AIBridgeTokenStore.prototype.getToken = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.db) {
                reject(new Error("数据库未初始化"));
                return;
            }
            _this.db.get("SELECT access_token FROM bridge_tokens ORDER BY id DESC LIMIT 1", function (err, row) {
                if (err) {
                    reject(err);
                }
                else {
                    if (row) {
                        resolve({
                            access_token: row.access_token,
                        });
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    };
    AIBridgeTokenStore.prototype.clearToken = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.db) {
                reject(new Error("数据库未初始化"));
                return;
            }
            _this.db.run("DELETE FROM bridge_tokens", function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    };
    return AIBridgeTokenStore;
}());
exports.aiBridgeTokenStore = new AIBridgeTokenStore();
