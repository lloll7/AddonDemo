import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(__dirname, "../data/dataBase.db");

interface TokenRow {
  id: number;
  at: string;
  rt: string;
  apiKey: string;
  region: string;
  account: string;
  created_at: string;
}

class TokenStore {
  private db: sqlite3.Database;

  constructor() {
    this.initDatabase();
  }

  private initDatabase(): void {
    // 确保data目录存在
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

  private initTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        at TEXT NOT NULL,
        rt TEXT NOT NULL,
        apiKey TEXT NOT NULL,
        region TEXT NOT NULL,
        account TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db?.run(sql, (err: Error | null) => {
      if (err) {
        console.error("创建表失败:", err.message);
      } else {
        console.log("Token表已就绪");
      }
    });
  }

  setToken(
    at: string,
    rt: string,
    apiKey: string,
    region: string,
    account: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }

      // 先清除旧token，再插入新token
      this.db.serialize(() => {
        this.db?.run("DELETE FROM tokens", (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }

          this.db?.run(
            "INSERT INTO tokens (at, rt, apiKey, region, account) VALUES (?, ?, ?, ?, ?)",
            [at, rt, apiKey, region, account],
            function (this: sqlite3.RunResult, err: Error | null) {
              if (err) {
                reject(err);
              } else {
                console.log("Token已存储到数据库，ID:", this.lastID);
                resolve();
              }
            }
          );
        });
      });
    });
  }

  getToken(): Promise<{
    at: string;
    rt: string;
    apiKey: string;
    region: string;
    account: string;
  } | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }

      this.db.get(
        "SELECT at, rt, apiKey, region, account FROM tokens ORDER BY id DESC LIMIT 1",
        (err: Error | null, row: TokenRow) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              resolve({
                at: row.at,
                rt: row.rt,
                apiKey: row.apiKey,
                region: row.region,
                account: row.account,
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

      this.db.run("DELETE FROM tokens", (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          console.log("Token已从数据库清除");
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
export const tokenStore = new TokenStore();
