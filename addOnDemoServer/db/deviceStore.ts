import sqlite3 from "sqlite3";
import path, { resolve } from "path";
import fs from "fs";
import type { IThing } from "../ts/interface/IThing";
import { request } from "http";
import { rejects } from "assert";

const DB_PATH = path.join(__dirname, "../data/dataBase.db");

class DeviceStore {
  private db: sqlite3.Database;

  constructor() {
    this.initDataBase();
  }

  private initDataBase(): void {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new sqlite3.Database(DB_PATH, (err: Error | null) => {
      if (err) {
        console.error("数据库连接失败:", err.message);
      } else {
        console.log("已连接到SQLite数据库");
        this.initTable();
      }
    });
  }
  // 初始化ewelink设备表
  private initTable(): void {
    console.log("初始化device表");
    const sql = `CREATE TABLE IF NOT EXISTS devices(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            deviceid TEXT,
            apikey TEXT,
            extra TEXT,
            brandName TEXT,
            brandLogo TEXT,
            showBrand INTEGER,
            productModel TEXT,
            family TEXT,
            devicekey TEXT,
            online INTEGER,
            devGroups TEXT,
            tags TEXT,
            devConfig TEXT,
            settings TEXT,
            sharedBy TEXT,
            shareTo TEXT,
            params TEXT,
            gsmInfoData TEXT
        );`;
    this.db?.run(sql, (err: Error | null) => {
      if (err) {
        console.error("创建表失败:", err.message);
      } else {
        console.log("devices表已就绪");
      }
    });
  }
  // 批量插入设备数据
  setDevices(devices: IThing[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }
      if (!Array.isArray(devices) || devices.length === 0) {
        resolve();
        return;
      }
      this.db.serialize(() => {
        const keys = Object.keys(devices[0]);
        const placeholders = keys.map(() => "?").join(", ");
        const stmt = this.db.prepare(
          `INSERT INTO devices (${keys.join(", ")}) VALUES (${placeholders})`
        );
        for (const device of devices) {
          stmt.run(Object.values(device), (err: Error | null) => {
            if (err) {
              console.error("批量插入device失败:", err.message);
            }
          });
        }
        stmt.finalize((err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            console.log("批量device已存储到数据库");
            resolve();
          }
        });
      });
    });
  }
  // 插入设备数据
  setDevice(device: IThing): Promise<void> {
    const keys = Object.keys(device);
    const placeholders = keys.map(() => "?").join(", ");
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }

      this.db.serialize(() => {
        this.db?.run(
          `INSERT INTO devices (${keys.join(", ")}) VALUES (${placeholders})`,
          Object.values(device).map((v) =>
            typeof v === "string" ? v : JSON.stringify(v)
          ),
          (err: Error | null) => {
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
  }

  getDevice(deviceId: string): Promise<IThing | null> {
    console.log(deviceId, "deviceId");
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }
      this.db.get(
        "SELECT * FROM devices WHERE deviceid = ?",
        [deviceId],
        (err: Error | null, row: any) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              resolve(row as IThing);
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  }

  deleteDevice(deviceId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }
      this.db.run(
        "DELETE FROM devices WHERE deviceid = ?",
        [deviceId],
        (err: Error | null, row: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  clearDevices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }
      this.db.run("DELETE FROM devices", (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          console.log("设备表已清空");
          resolve();
        }
      });
    });
  }

  close(): void {
    if (this.db) {
      this.db.close((err: Error | null) => {
        if (err) {
          console.error("关闭数据库失败:", err.message);
        } else {
          console.log("数据库连接已关闭");
        }
      });
    }
  }
}

// 导出单例实例
export const deviceStore = new DeviceStore();
