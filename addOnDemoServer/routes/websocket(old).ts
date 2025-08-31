import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

const router = express.Router();

// WebSocket 客户端管理
const clients: Array<{ id: number; ws: WebSocket; isAlive: boolean }> = [];
let clientId = 5174;
let wss: WebSocketServer | null = null;

// 初始化 WebSocket 服务器
export function initializeWebSocket(server: Server) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    const id = clientId;
    const client = { id, ws, isAlive: true };
    clients.push(client);

    console.log(`WebSocket 客户端 ${id} 已连接，当前连接数: ${clients.length}`);

    // 发送欢迎消息
    ws.send(
      JSON.stringify({
        type: "welcome",
        message: "WebSocket 连接已建立",
        id,
        timestamp: Date.now(),
      })
    );

    // 处理消息
    ws.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        console.log(`收到来自客户端 ${id} 的消息:`, message);

        // 处理不同类型的消息
        switch (message.type) {
          case "ping":
            // 心跳响应
            ws.send(
              JSON.stringify({
                type: "pong",
                timestamp: Date.now(),
              })
            );
            break;
          case "broadcast":
            // 广播消息给所有客户端
            broadcast({
              type: "broadcast",
              from: id,
              message: message.message,
              timestamp: Date.now(),
            });
            break;
          default:
            // 默认回显消息
            ws.send(
              JSON.stringify({
                type: "echo",
                originalMessage: message,
                timestamp: Date.now(),
              })
            );
        }
      } catch (error) {
        console.error("解析消息失败:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "消息格式错误",
            timestamp: Date.now(),
          })
        );
      }
    });

    // 处理连接关闭
    ws.on("close", () => {
      const idx = clients.findIndex((c) => c.id === id);
      if (idx >= 0) {
        clients.splice(idx, 1);
        console.log(
          `WebSocket 客户端 ${id} 已断开，当前连接数: ${clients.length}`
        );
      }
    });

    // 处理错误
    ws.on("error", (error) => {
      console.error(`WebSocket 客户端 ${id} 错误:`, error);
      const idx = clients.findIndex((c) => c.id === id);
      if (idx >= 0) {
        clients.splice(idx, 1);
      }
    });

    // 设置心跳检测
    ws.on("pong", () => {
      const client = clients.find((c) => c.id === id);
      if (client) {
        client.isAlive = true;
      }
    });
  });

  // 定期心跳检测
  const heartbeat = setInterval(() => {
    clients.forEach((client) => {
      if (client.isAlive === false) {
        console.log(`终止无响应的客户端 ${client.id}`);
        client.ws.terminate();
        const idx = clients.findIndex((c) => c.id === client.id);
        if (idx >= 0) {
          clients.splice(idx, 1);
        }
        return;
      }

      client.isAlive = false;
      client.ws.ping();
    });
  }, 30000); // 30秒心跳间隔

  // 清理心跳定时器
  wss.on("close", () => {
    clearInterval(heartbeat);
  });
}

// 广播消息给所有客户端
export function broadcast(data: unknown) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

// 发送消息给特定客户端
export function sendTo(
  predicate: (client: { id: number }) => boolean,
  data: unknown
) {
  const message = JSON.stringify(data);
  clients.filter(predicate).forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

// 获取客户端数量
export function getClientCount() {
  return clients.length;
}

// 获取所有客户端信息
export function getClients() {
  return clients.map(({ id, isAlive }) => ({ id, isAlive }));
}

// HTTP 路由用于管理 WebSocket
router.get("/status", (req, res) => {
  res.json({
    connected: clients.length,
    clients: getClients(),
    timestamp: Date.now(),
  });
});

// 通过 HTTP 发送广播消息
router.post("/broadcast", express.json(), (req, res) => {
  const payload = req.body ?? {};
  broadcast({
    type: "http_broadcast",
    message: payload,
    timestamp: Date.now(),
  });
  res.json({
    sent: clients.length,
    message: "广播消息已发送",
  });
});

// 发送消息给特定客户端
router.post("/send", express.json(), (req, res) => {
  const { clientId, message } = req.body;

  if (!clientId || !message) {
    return res.status(400).json({
      error: "缺少 clientId 或 message 参数",
    });
  }

  sendTo((client) => client.id === clientId, {
    type: "http_message",
    message,
    timestamp: Date.now(),
  });

  res.json({
    sent: true,
    message: `消息已发送给客户端 ${clientId}`,
  });
});

export default router;
