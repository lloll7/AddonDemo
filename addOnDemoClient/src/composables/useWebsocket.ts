// example.ts
import { WebSocketClient } from "./webSocket";
import type {
  ServerMessage,
  DeviceStatusUpdateMessage,
} from "@/ts/interface/IWebsocket";
import type { IThingParams } from "@/ts/interface/IThing";
import { useDeviceListStore } from "@/store/deviceList";
import { useEtcStore } from "@/store/etc";
// 注意：不要在模块顶层直接调用 useDeviceListStore，否则会在 pinia 初始化前报错。

// 由于 process 不是浏览器环境的全局变量，这里需要改为使用 import.meta.env 读取环境变量
const wsUrl = import.meta.env.VITE_WS_URL || "/ws";
// 创建WebSocket客户端
const wsClient = new WebSocketClient({
  url: wsUrl,
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
      case "device_update":
        console.log("收到设备更新消息:", data.message);
        const dataMsg = data.message as DeviceStatusUpdateMessage;
        const deviceListStore = useDeviceListStore();
        if (dataMsg.action === "update") {
          const updateStatus: IThingParams = {};
          if (typeof dataMsg.params.childLock === "boolean") {
            updateStatus.childLock = dataMsg.params.childLock;
          }
          if (dataMsg.params.workMode) {
            updateStatus.workMode = dataMsg.params.workMode;
          }
          //   deviceListStore.changeDeviceState("sysmsg", { online: false }, "a400012c27");
          deviceListStore.changeDeviceState(
            dataMsg.action,
            updateStatus,
            dataMsg.deviceid,
          );
        } else if (dataMsg.action === "sysmsg") {
          deviceListStore.changeDeviceState(
            dataMsg.action,
            dataMsg.params,
            dataMsg.deviceid,
          );
        }
      case "pong":
        console.log("心跳响应正常");
        break;
      default:
        console.log("未知消息类型:", data.type);
    }
  })
  .onDisconnect((event) => {
    console.log("连接断开, 代码:", event.code, "原因:", event.reason);
  })
  .onError((error) => {
    console.error("连接错误:", error);
  });

// 建立连接
// wsClient.connect();

// 示例：定期发送消息
setInterval(() => {
  if (wsClient.isConnected) {
    wsClient.sendBroadcast(`定时消息 - ${new Date().toLocaleTimeString()}`);
  }
}, 60000); // 每分钟发送一次

// 导出客户端实例供其他模块使用
export { wsClient };
