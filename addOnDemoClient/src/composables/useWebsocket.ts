// example.ts
import { WebSocketClient } from "./webSocket";
import type { ServerMessage } from "@/ts/interface/IWebsocket";

// 创建WebSocket客户端
const wsClient = new WebSocketClient({
  url: "ws://localhost:3000",
  heartbeatInterval: 25000,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
});

// 设置事件处理器
wsClient
  .onConnect(() => {
    console.log("连接成功!");
    // 连接成功后发送广播消息
    wsClient.sendBroadcast("Hello from client!");
  })
  .onMessage((data: ServerMessage) => {
    console.log("收到消息:", data);

    // 根据消息类型进行不同处理
    switch (data.type) {
      case "welcome":
        console.log(`客户端ID: ${data.id}, 消息: ${data.message}`);
        break;
      case "broadcast":
        console.log(`广播消息: ${data.message}, 来自: ${data.from}`);
        break;
      case "pong":
        console.log("心跳响应正常");
        break;
    }
  })
  .onDisconnect((event) => {
    console.log("连接断开, 代码:", event.code, "原因:", event.reason);
  })
  .onError((error) => {
    console.error("连接错误:", error);
  });

// 建立连接
wsClient.connect();

// 示例：定期发送消息
setInterval(() => {
  if (wsClient.isConnected) {
    wsClient.sendBroadcast(`定时消息 - ${new Date().toLocaleTimeString()}`);
  }
}, 60000); // 每分钟发送一次

// 示例：手动发送心跳
function manualPing() {
  if (wsClient.isConnected) {
    wsClient.sendPing();
  }
}

// 导出客户端实例供其他模块使用
export { wsClient };
