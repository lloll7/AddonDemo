"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenStore = void 0;
var sqlite3_1 = __importDefault(require("sqlite3"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var DB_PATH = path_1.default.join(__dirname, "../data/dataBase.db");
var TokenStore = /** @class */ (function () {
    function TokenStore() {
        this.initDatabase();
    }
    TokenStore.prototype.initDatabase = function () {
        var _this = this;
        // 确保data目录存在
        var dataDir = path_1.default.dirname(DB_PATH);
        if (!fs_1.default.existsSync(dataDir)) {
            fs_1.default.mkdirSync(dataDir, { recursive: true });
        }
        this.db = new sqlite3_1.default.Database(DB_PATH, function (err) {
            if (err) {
                console.error("数据库连接失败:", err.message);
            }
            else {
                console.log("已连接到SQLite数据库");
                _this.initTable();
            }
        });
    };
    TokenStore.prototype.initTable = function () {
        var _a;
        var sql = "\n      CREATE TABLE IF NOT EXISTS tokens (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        at TEXT NOT NULL,\n        rt TEXT NOT NULL,\n        apiKey TEXT NOT NULL,\n        region TEXT NOT NULL,\n        account TEXT NOT NULL,\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n      )\n    ";
        (_a = this.db) === null || _a === void 0 ? void 0 : _a.run(sql, function (err) {
            if (err) {
                console.error("创建表失败:", err.message);
            }
            else {
                console.log("Token表已就绪");
            }
        });
    };
    TokenStore.prototype.setToken = function (at, rt, apiKey, region, account) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.db) {
                reject(new Error("数据库未初始化"));
                return;
            }
            // 先清除旧token，再插入新token
            _this.db.serialize(function () {
                var _a;
                (_a = _this.db) === null || _a === void 0 ? void 0 : _a.run("DELETE FROM tokens", function (err) {
                    var _a;
                    if (err) {
                        reject(err);
                        return;
                    }
                    (_a = _this.db) === null || _a === void 0 ? void 0 : _a.run("INSERT INTO tokens (at, rt, apiKey, region, account) VALUES (?, ?, ?, ?, ?)", [at, rt, apiKey, region, account], function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            console.log("Token已存储到数据库，ID:", this.lastID);
                            resolve();
                        }
                    });
                });
            });
        });
    };
    TokenStore.prototype.getToken = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.db) {
                reject(new Error("数据库未初始化"));
                return;
            }
            _this.db.get("SELECT at, rt, apiKey, region, account FROM tokens ORDER BY id DESC LIMIT 1", function (err, row) {
                if (err) {
                    reject(err);
                }
                else {
                    if (row) {
                        resolve({
                            at: row.at,
                            rt: row.rt,
                            apiKey: row.apiKey,
                            region: row.region,
                            account: row.account,
                        });
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    };
    TokenStore.prototype.clearToken = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.db) {
                reject(new Error("数据库未初始化"));
                return;
            }
            _this.db.run("DELETE FROM tokens", function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    console.log("Token已从数据库清除");
                    resolve();
                }
            });
        });
    };
    TokenStore.prototype.close = function () {
        if (this.db) {
            this.db.close(function (err) {
                if (err) {
                    console.error("关闭数据库失败:", err.message);
                }
                else {
                    console.log("数据库连接已关闭");
                }
            });
        }
    };
    return TokenStore;
}());
// 导出单例实例
exports.tokenStore = new TokenStore();
