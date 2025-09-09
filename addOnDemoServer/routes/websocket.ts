// routes/websocket.ts
import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { deviceServerManager } from "../webscoketServer/deviceServerManager";
import { controlService } from "../service/websocketService";
import { tokenStore } from "../db/tokenStore";
import type {
  ClientMessage,
  ServerMessage,
  DeviceResponseMessage,
  DeviceControlMessage,
} from "../ts/interface/IWebsocket";
import { v4 } from "uuid";
import { createNoce } from "../util/public";
import { secret } from "../ts/secret";

const router = express.Router();

// WebSocket 客户端管理
const clients: Array<{ id: number; ws: WebSocket; isAlive: boolean }> = [];
let clientId = 0;
let wss: WebSocketServer | null = null;

// 初始化 WebSocket 服务器
export async function initializeWebSocket(server: Server) {
  wss = new WebSocketServer({ server });

  // 设置设备响应回调函数，用于广播设备消息给前端
  deviceServerManager.setDeviceStatusUpdateCallback((deviceResponse) => {
    console.log("收到设备服务器消息，准备广播给前端:", deviceResponse);

    // 广播设备响应消息给所有前端客户端
    broadcast({
      type: "device_update",
      message: deviceResponse,
      timestamp: Date.now(),
    });
  });

  wss.on("connection", async (ws: WebSocket) => {
    // 初始化设备服务器管理器
    try {
      await deviceServerManager.initialize();
      const tokenInfo = await tokenStore.getToken();
      await deviceServerManager.performHandshake({
        action: "userOnline",
        version: 8,
        at: tokenInfo.at,
        userAgent: "app",
        apikey: tokenInfo.apiKey,
        appid: secret.EWELINK_APP_APPID,
        nonce: createNoce(),
        sequence: String(Date.now()),
      });
      console.log("设备服务器管理器初始化成功");
    } catch (error) {
      console.error("设备服务器管理器初始化失败:", error);
    }
    const id = ++clientId;
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
    ws.on("message", async (data: Buffer) => {
      try {
        const message: ClientMessage = JSON.parse(data.toString());
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
          //   case "handshake":
          //     // 处理握手消息
          //     await handleHandShake(message, id, ws);
          //     break;

          case "device_control":
            // 处理设备控制消息
            await handleDeviceControl(message, id, ws);
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
      clearInterval(heartbeat);
      deviceServerManager.disconnect(); // 断开设备服务器连接
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

  //   // 清理心跳定时器
  //   wss.on("close", () => {
  //     clearInterval(heartbeat);
  //     deviceServerManager.disconnect(); // 断开设备服务器连接
  //   });
}

// 处理设备控制消息
async function handleDeviceControl(
  message: ClientMessage,
  clientId: number,
  ws: WebSocket
) {
  try {
    // 先判断 message.message 是否为对象且包含 deviceid
    if (
      typeof message.message !== "object" ||
      !message.message ||
      !("deviceid" in message.message)
    ) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "设备控制消息缺少必要参数",
          timestamp: Date.now(),
        })
      );
      return;
    }

    // 检查设备服务器连接状态
    if (!deviceServerManager.isConnected()) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "设备服务器未连接",
          timestamp: Date.now(),
        })
      );
      return;
    }
    // 发送设备控制指令到设备服务器
    const response = await deviceServerManager.sendDeviceControl(
      message.message
    );

    // 将设备响应发送回客户端
    const clientMessage: ServerMessage = {
      type: "device_response",
      message: response,
      timestamp: Date.now(),
    };
    // 如果是同步设备的状态变更，在这里判断设备状态改变是否成功，成功则上报设备状态更新
    // ....
    ws.send(JSON.stringify(clientMessage));
  } catch (error) {
    console.error("设备控制处理失败:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: `设备控制失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
        timestamp: Date.now(),
      })
    );
  }
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
    deviceServerConnected: deviceServerManager.isConnected(),
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

// 通过 HTTP 发送设备控制指令
router.post("/device-control", express.json(), async (req, res) => {
  try {
    if (!deviceServerManager.isConnected()) {
      return res.status(503).json({
        error: "设备服务器未连接",
      });
    }
    controlService(req.body);
    res.json({
      event: {
        header: {
          name: "Response",
          message_id: v4(),
          version: "2",
        },
        payload: {},
      },
    });
  } catch (error) {
    res.status(500).json({
      error: `设备控制失败: ${
        error instanceof Error ? error.message : "未知错误"
      }`,
    });
  }
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
