"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
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
      } else {
        console.log("已连接到SQLite数据库");
        _this.initTable();
      }
    });
  };
  // 初始化ewelink设备表
  DeviceStore.prototype.initTable = function () {
    var _this = this;
    var _a;
    console.log("初始化device表");
    var sql =
      "CREATE TABLE IF NOT EXISTS devices(\n            id INTEGER PRIMARY KEY AUTOINCREMENT,\n            name TEXT,\n            deviceid TEXT,\n            apikey TEXT,\n            extra TEXT,\n            brandName TEXT,\n            brandLogo TEXT,\n            showBrand INTEGER,\n            productModel TEXT,\n            family TEXT,\n            devicekey TEXT,\n            online INTEGER,\n            devGroups TEXT,\n            tags TEXT,\n            devConfig TEXT,\n            settings TEXT,\n            sharedBy TEXT,\n            shareTo TEXT,\n            params TEXT,\n            gsmInfoData TEXT\n        );";
    (_a = this.db) === null || _a === void 0
      ? void 0
      : _a.run(sql, function (err) {
          if (err) {
            console.error("创建表失败:", err.message);
          } else {
            console.log("devices表已就绪");
            // 确保缺失列被补齐（用于已有数据库的迁移）
            _this.ensureColumn("deviceConfigToApp", "TEXT");
            _this.ensureColumn("denyFeatures", "TEXT");
            _this.ensureColumn("isSupportGroup", "TEXT");
            _this.ensureColumn("isSupportedOnMP", "TEXT");
            _this.ensureColumn("isSupportChannelSplit", "TEXT");
            _this.ensureColumn("deviceFeature", "TEXT");
            _this.ensureColumn("matterInfoData", "TEXT");
            _this.ensureColumn("trigger", "TEXT");
            _this.ensureColumn("operations", "TEXT");
            _this.ensureColumn("tmValid", "TEXT");
            _this.ensureColumn("showOnHomepage", "TEXT");
          }
        });
  };
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
        var placeholders = keys
          .map(function () {
            return "?";
          })
          .join(", ");
        var stmt = _this.db.prepare(
          "INSERT INTO devices ("
            .concat(keys.join(", "), ") VALUES (")
            .concat(placeholders, ")")
        );
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
          } else {
            console.log("批量device已存储到数据库");
            resolve();
          }
        });
      });
    });
  };
  // 如果列不存在则添加，避免旧表缺列导致插入失败
  DeviceStore.prototype.ensureColumn = function (columnName, columnType) {
    var _this = this;
    if (!this.db) return;
    this.db.all("PRAGMA table_info(devices)", function (err, rows) {
      if (err) {
        console.error("读取 devices 表结构失败:", err.message);
        return;
      }
      var exists = Array.isArray(rows)
        ? rows.some(function (r) {
            return r.name === columnName;
          })
        : false;
      if (!exists) {
        _this.db.run(
          "ALTER TABLE devices ADD COLUMN "
            .concat(columnName, " ")
            .concat(columnType),
          function (alterErr) {
            if (alterErr) {
              console.error(
                "\u6DFB\u52A0\u5217 ".concat(columnName, " \u5931\u8D25:"),
                alterErr.message
              );
            } else {
              console.log(
                "\u5DF2\u4E3A devices \u8868\u6DFB\u52A0\u7F3A\u5931\u5217: ".concat(
                  columnName
                )
              );
            }
          }
        );
      }
    });
  };
  // 插入设备数据
  DeviceStore.prototype.setDevice = function (device) {
    var _this = this;
    var keys = Object.keys(device);
    var placeholders = keys
      .map(function () {
        return "?";
      })
      .join(", ");
    return new Promise(function (resolve, reject) {
      if (!_this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }
      _this.db.serialize(function () {
        var _a;
        (_a = _this.db) === null || _a === void 0
          ? void 0
          : _a.run(
              "INSERT INTO devices ("
                .concat(keys.join(", "), ") VALUES (")
                .concat(placeholders, ")"),
              Object.values(device).map(function (v) {
                return typeof v === "string" ? v : JSON.stringify(v);
              }),
              function (err) {
                if (err) {
                  reject(err);
                } else {
                  console.log("device已存储到数据库");
                  resolve();
                }
              }
            );
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
      _this.db.get(
        "SELECT * FROM devices WHERE deviceid = ?",
        [deviceId],
        function (err, row) {
          if (err) {
            reject(err);
          } else {
            if (row) {
              resolve(row);
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  };
  DeviceStore.prototype.deleteDevice = function (deviceId) {
    var _this = this;
    return new Promise(function (resolve, reject) {
      if (!_this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }
      _this.db.run(
        "DELETE FROM devices WHERE deviceid = ?",
        [deviceId],
        function (err, row) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
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
        } else {
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
        } else {
          console.log("数据库连接已关闭");
        }
      });
    }
  };
  return DeviceStore;
})();
// 导出单例实例
exports.deviceStore = new DeviceStore();
