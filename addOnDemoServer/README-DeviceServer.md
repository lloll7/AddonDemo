# 设备服务器管理器使用说明

## 概述

设备服务器管理器（DeviceServerManager）是一个单例模式的类，用于管理设备WebSocket服务器的连接、握手和设备控制操作。

## 主要功能

1. **连接管理**：自动连接到设备服务器
2. **握手操作**：与设备服务器进行握手认证
3. **设备控制**：发送设备控制指令
4. **状态监控**：监控连接状态

## 使用方法

### 1. 基本使用

```typescript
import { deviceServerManager } from "./service/deviceServerManager";

// 初始化设备服务器连接
await deviceServerManager.initialize();

// 检查连接状态
if (deviceServerManager.isConnected()) {
  console.log("设备服务器已连接");
}
```

### 2. 登录后进行握手

```typescript
import { deviceServerManager } from "./service/deviceServerManager";
import { createNoce } from "./util/public";

// 在登录成功后进行握手
async function performHandshakeAfterLogin(accessToken: string, apiKey: string) {
  try {
    // 检查设备服务器是否已连接
    if (!deviceServerManager.isConnected()) {
      await deviceServerManager.initialize();
    }

    // 构建握手消息
    const handshakeMessage = {
      action: "userOnline",
      version: 8,
      at: accessToken,
      userAgent: "app",
      apikey: apiKey,
      appid: process.env.EWELINK_APP_APPID,
      nonce: createNoce(),
      sequence: String(Date.now()),
    };

    // 执行握手
    const response = await deviceServerManager.performHandshake(handshakeMessage);
    console.log("握手成功:", response);
    
  } catch (error) {
    console.error("握手失败:", error);
  }
}
```

### 3. 发送设备控制指令

```typescript
// 发送设备控制指令
async function controlDevice(deviceId: string, params: any) {
  try {
    const controlMessage = {
      action: "update",
      apiKey: "your-api-key",
      deviceid: deviceId,
      params: params,
      userAgnet: "app",
      sequence: String(Date.now()),
    };

    const response = await deviceServerManager.sendDeviceControl(controlMessage);
    console.log("设备控制成功:", response);
    
  } catch (error) {
    console.error("设备控制失败:", error);
  }
}
```

### 4. 在路由中使用

```typescript
// routes/user.ts
import { deviceServerManager } from "../service/deviceServerManager";

router.post("/login", async function (req, res, next) {
  try {
    // 登录逻辑...
    
    // 登录成功后进行握手
    if (deviceServerManager.isConnected()) {
      const handShakeResult = await deviceServerManager.performHandshake({
        action: "userOnline",
        version: 8,
        at: result.data.at,
        userAgent: "app",
        apikey: result.data.user.apikey,
        appid: process.env.EWELINK_APP_APPID,
        nonce: createNoce(),
        sequence: String(Date.now()),
      });
      console.log("设备服务器握手成功:", handShakeResult);
    }
    
    res.json(returnToken);
  } catch (error) {
    console.error("登录失败:", error);
    res.status(500).json({ error: "登录失败", msg: error.message });
  }
});
```

### 5. 在中间件中使用

```typescript
// 创建握手中间件
export async function handshakeMiddleware(req: any, res: any, next: any) {
  try {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    const apiKey = req.headers['x-api-key'];
    
    if (!accessToken || !apiKey) {
      return next();
    }

    // 检查设备服务器连接状态
    if (!deviceServerManager.isConnected()) {
      await deviceServerManager.initialize();
    }

    // 执行握手
    const handshakeMessage = {
      action: "userOnline",
      version: 8,
      at: accessToken,
      userAgent: "app",
      apikey: apiKey,
      appid: process.env.EWELINK_APP_APPID,
      nonce: createNoce(),
      sequence: String(Date.now()),
    };

    await deviceServerManager.performHandshake(handshakeMessage);
    next();
  } catch (error) {
    console.error("中间件握手失败:", error);
    next(error);
  }
}
```

## API 参考

### DeviceServerManager 类

#### 方法

- `initialize(): Promise<void>` - 初始化设备服务器连接
- `isConnected(): boolean` - 检查设备服务器是否已连接
- `performHandshake(message: HandShakeMessage): Promise<HandShakeResponse>` - 执行握手操作
- `sendDeviceControl(message: any): Promise<any>` - 发送设备控制指令
- `disconnect(): void` - 断开设备服务器连接
- `getDeviceServer(): DeviceServerClient | null` - 获取设备服务器实例

### 接口定义

#### HandShakeMessage
```typescript
interface HandShakeMessage {
  action: string; // 固定参数 "userOnline"
  at: string; // 访问令牌
  apikey: string; // API密钥
  appid: string; // 应用ID
  nonce: string; // 随机数
  ts?: number; // 时间戳（可选）
  userAgent: string; // 固定参数 "app"
  sequence: string; // 序列号
  version: number; // 接口版本：8
}
```

#### HandShakeResponse
```typescript
interface HandShakeResponse {
  error: number; // 错误码
  apiKey: string; // API密钥
  config: {
    hb: number; // 心跳间隔
    hbInterval: number; // 心跳间隔
  };
  sequence: string; // 序列号
}
```

## 注意事项

1. **单例模式**：DeviceServerManager 是单例模式，整个应用只有一个实例
2. **连接管理**：管理器会自动处理连接、重连和断开
3. **错误处理**：所有方法都会抛出异常，需要适当的错误处理
4. **环境变量**：需要设置 `DISPATCH_WEBSOCKET_ADDRESS` 和 `EWELINK_APP_APPID` 环境变量
5. **握手时机**：建议在用户登录成功后立即进行握手操作

## 示例文件

查看 `examples/handshake-example.ts` 文件获取更多使用示例。
