const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "../data/dataBase.db");

class TokenStore {
  constructor() {
    this.db = null;
    this.initDatabase();
  }

  initDatabase() {
    // 确保data目录存在
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("数据库连接失败:", err.message);
      } else {
        console.log("已连接到SQLite数据库");
        this.initTable();
      }
    });
  }

  initTable() {
    const sql = `
            CREATE TABLE IF NOT EXISTS tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                at TEXT NOT NULL,
                rt TEXT NOT NULL,
                apiKey TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

    this.db.run(sql, (err) => {
      if (err) {
        console.error("创建表失败:", err.message);
      } else {
        console.log("Token表已就绪");
      }
    });
  }

  setToken(at, rt, apiKey) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }

      // 先清除旧token，再插入新token
      this.db.serialize(() => {
        this.db.run("DELETE FROM tokens", (err) => {
          if (err) {
            reject(err);
            return;
          }

          this.db.run(
            "INSERT INTO tokens (at, rt, apiKey) VALUES (?)",
            [at, rt, apiKey],
            (err) => {
              if (err) {
                reject(err);
              } else {
                console.log("Token已存储到数据库");
                resolve();
              }
            }
          );
        });
      });
    });
  }

  getToken() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }

      this.db.get("SELECT at,rt,apiKey FROM tokens", (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.token : null);
        }
      });
    });
  }

  clearToken() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未初始化"));
        return;
      }

      this.db.run("DELETE FROM tokens", (err) => {
        if (err) {
          reject(err);
        } else {
          console.log("Token已从数据库清除");
          resolve();
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error("关闭数据库失败:", err.message);
        } else {
          console.log("数据库连接已关闭");
        }
      });
    }
  }
}

module.exports = new TokenStore();
