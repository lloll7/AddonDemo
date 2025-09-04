"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceStore = void 0;
var sqlite3_1 = __importDefault(require("sqlite3"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var DB_PATH = path_1.default.join(__dirname, "../data/dataBase.db");
var DeviceStore = /** @class */ (function () {
    function DeviceStore() {
        this.initDataBase();
    }
    DeviceStore.prototype.initDataBase = function () {
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
                console.log("已连接到SQLite数据库");
                _this.initTable();
            }
        });
    };
    // 初始化ewelink设备表
    DeviceStore.prototype.initTable = function () {
        var _a;
        console.log("初始化device表");
        var sql = "CREATE TABLE IF NOT EXISTS devices(\n            id INTEGER PRIMARY KEY AUTOINCREMENT,\n            name TEXT,\n            deviceid TEXT,\n            apikey TEXT,\n            extra TEXT,\n            brandName TEXT,\n            brandLogo TEXT,\n            showBrand INTEGER,\n            productModel TEXT,\n            family TEXT,\n            devicekey TEXT,\n            online INTEGER,\n            devGroups TEXT,\n            tags TEXT,\n            devConfig TEXT,\n            settings TEXT,\n            sharedBy TEXT,\n            shareTo TEXT,\n            params TEXT,\n            gsmInfoData TEXT\n        );";
        (_a = this.db) === null || _a === void 0 ? void 0 : _a.run(sql, function (err) {
            if (err) {
                console.error("创建表失败:", err.message);
            }
            else {
                console.log("devices表已就绪");
                // 确保缺失列被补齐（用于已有数据库的迁移）
                // this.ensureColumn("deviceConfigToApp", "TEXT");
                // this.ensureColumn("denyFeatures", "TEXT");
                // this.ensureColumn("isSupportGroup", "TEXT");
                // this.ensureColumn("isSupportedOnMP", "TEXT");
                // this.ensureColumn("isSupportChannelSplit", "TEXT");
                // this.ensureColumn("deviceFeature", "TEXT");
                // this.ensureColumn("matterInfoData", "TEXT");
                // this.ensureColumn("trigger", "TEXT");
                // this.ensureColumn("operations", "TEXT");
                // this.ensureColumn("tmValid", "TEXT");
                // this.ensureColumn("showOnHomepage", "TEXT");
            }
        });
    };
    // 如果列不存在则添加，避免旧表缺列导致插入失败
    //   private ensureColumn(columnName: string, columnType: string): void {
    //     if (!this.db) return;
    //     this.db.all(
    //       "PRAGMA table_info(devices)",
    //       (err: Error | null, rows: Array<{ name: string }>) => {
    //         if (err) {
    //           console.error("读取 devices 表结构失败:", err.message);
    //           return;
    //         }
    //         const exists = Array.isArray(rows)
    //           ? rows.some((r) => r.name === columnName)
    //           : false;
    //         if (!exists) {
    //           this.db.run(
    //             `ALTER TABLE devices ADD COLUMN ${columnName} ${columnType}`,
    //             (alterErr: Error | null) => {
    //               if (alterErr) {
    //                 console.error(`添加列 ${columnName} 失败:`, alterErr.message);
    //               } else {
    //                 console.log(`已为 devices 表添加缺失列: ${columnName}`);
    //               }
    //             }
    //           );
    //         }
    //       }
    //     );
    //   }
    // 批量插入设备数据
    DeviceStore.prototype.setDevices = function (devices) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.db) {
                reject(new Error("数据库未初始化"));
                return;
            }
            if (!Array.isArray(devices) || devices.length === 0) {
                resolve();
                return;
            }
            _this.db.serialize(function () {
                var keys = Object.keys(devices[0]);
                var placeholders = keys.map(function () { return "?"; }).join(", ");
                var stmt = _this.db.prepare("INSERT INTO devices (".concat(keys.join(", "), ") VALUES (").concat(placeholders, ")"));
                for (var _i = 0, devices_1 = devices; _i < devices_1.length; _i++) {
                    var device = devices_1[_i];
                    stmt.run(Object.values(device), function (err) {
                        if (err) {
                            console.error("批量插入device失败:", err.message);
                        }
                    });
                }
                stmt.finalize(function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        console.log("批量device已存储到数据库");
                        resolve();
                    }
                });
            });
        });
    };
    // 插入设备数据
    DeviceStore.prototype.setDevice = function (device) {
        var _this = this;
        var keys = Object.keys(device);
        var placeholders = keys.map(function () { return "?"; }).join(", ");
        return new Promise(function (resolve, reject) {
            if (!_this.db) {
                reject(new Error("数据库未初始化"));
                return;
            }
            _this.db.serialize(function () {
                var _a;
                (_a = _this.db) === null || _a === void 0 ? void 0 : _a.run("INSERT INTO devices (".concat(keys.join(", "), ") VALUES (").concat(placeholders, ")"), Object.values(device).map(function (v) {
                    return typeof v === "string" ? v : JSON.stringify(v);
                }), function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        console.log("device已存储到数据库");
                        resolve();
                    }
                });
            });
        });
    };
    DeviceStore.prototype.getDevice = function (deviceId) {
        var _this = this;
        console.log(deviceId, "deviceId");
        return new Promise(function (resolve, reject) {
            if (!_this.db) {
                reject(new Error("数据库未初始化"));
                return;
            }
            _this.db.get("SELECT * FROM devices WHERE deviceid = ?", [deviceId], function (err, row) {
                if (err) {
                    reject(err);
                }
                else {
                    if (row) {
                        resolve(row);
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    };
    DeviceStore.prototype.deleteDevice = function (deviceId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.db) {
                reject(new Error("数据库未初始化"));
                return;
            }
            _this.db.run("DELETE FROM devices WHERE deviceid = ?", [deviceId], function (err, row) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    };
    DeviceStore.prototype.clearDevices = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.db) {
                reject(new Error("数据库未初始化"));
                return;
            }
            _this.db.run("DELETE FROM devices", function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    console.log("设备表已清空");
                    resolve();
                }
            });
        });
    };
    DeviceStore.prototype.close = function () {
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
    return DeviceStore;
}());
// 导出单例实例
exports.deviceStore = new DeviceStore();
