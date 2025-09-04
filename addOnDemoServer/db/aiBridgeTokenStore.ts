import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(__dirname, "../data/dataBase.db");

interface BridgeTokenRow {
  id: number;
  access_token: string;
}

class AIBridgeTokenStore {
  private db: sqlite3.Database;

  constructor() {
    this.initDatabase();
  }

  private initDatabase(): void {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new sqlite3.Database(DB_PATH, (err: Error | null) => {
      if (err) {
        console.error("数据库连接失败:", err.message);
      } else {
        this.initTable();
      }
    });
  }

  private initTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS bridge_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        access_token TEXT NOT NULL
      )
    `;

    this.db?.run(sql, (err: Error | null) => {
      if (err) {
        console.error("创建 bridge_tokens 表失败:", err.message);
      }
    });
  }

  saveToken(access_token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }
      this.db.serialize(() => {
        this.db?.run("DELETE FROM bridge_tokens", (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
          this.db?.run(
            "INSERT INTO bridge_tokens (access_token) VALUES (?)",
            [access_token],
            function (this: sqlite3.RunResult, err: Error | null) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });
      });
    });
  }

  getToken(): Promise<{
    access_token: string;
  } | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }
      this.db.get(
        "SELECT access_token FROM bridge_tokens ORDER BY id DESC LIMIT 1",
        (err: Error | null, row: BridgeTokenRow) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              resolve({
                access_token: row.access_token,
              });
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  }

  clearToken(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }
      this.db.run("DELETE FROM bridge_tokens", (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export const aiBridgeTokenStore = new AIBridgeTokenStore();
