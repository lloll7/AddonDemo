# WebSocket 功能说明

## 概述

本项目已集成WebSocket功能，与SSE（Server-Sent Events）建立方式保持一致。WebSocket提供了双向实时通信能力，支持客户端与服务器之间的即时消息传递。

## 功能特性

### 1. 连接管理
- 自动客户端ID分配
- 连接状态监控
- 心跳检测机制（30秒间隔）
- 自动清理断开的连接

### 2. 消息处理
- 支持多种消息类型
- 消息广播功能
- 点对点消息发送
- 消息回显功能

### 3. HTTP API接口
- `/ws/status` - 获取连接状态
- `/ws/broadcast` - HTTP方式发送广播消息
- `/ws/send` - HTTP方式发送点对点消息

## 使用方法

### 1. 启动服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动，WebSocket服务会自动初始化。

### 2. 测试WebSocket连接

访问测试页面：`http://localhost:3000/websocket-test.html`

### 3. WebSocket客户端连接

```javascript
// 创建WebSocket连接
const ws = new WebSocket('ws://localhost:3000');

// 连接建立
ws.onopen = function() {
    console.log('WebSocket连接已建立');
};

// 接收消息
ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('收到消息:', data);
};

// 发送消息
ws.send(JSON.stringify({
    type: 'message',
    message: 'Hello WebSocket!'
}));
```

## 消息类型

### 客户端发送的消息类型

1. **ping** - 心跳检测
```javascript
{
    type: 'ping',
    timestamp: Date.now()
}
```

2. **broadcast** - 广播消息
```javascript
{
    type: 'broadcast',
    message: '要广播的消息内容'
}
```

3. **message** - 普通消息（会回显）
```javascript
{
    type: 'message',
    message: '消息内容',
    timestamp: Date.now()
}
```

### 服务器发送的消息类型

1. **welcome** - 欢迎消息
```javascript
{
    type: 'welcome',
    message: 'WebSocket 连接已建立',
    id: 客户端ID,
    timestamp: Date.now()
}
```

2. **pong** - 心跳响应
```javascript
{
    type: 'pong',
    timestamp: Date.now()
}
```

3. **echo** - 消息回显
```javascript
{
    type: 'echo',
    originalMessage: 原始消息,
    timestamp: Date.now()
}
```

4. **broadcast** - 广播消息
```javascript
{
    type: 'broadcast',
    from: 发送者ID,
    message: '消息内容',
    timestamp: Date.now()
}
```

5. **http_broadcast** - HTTP触发的广播
```javascript
{
    type: 'http_broadcast',
    message: 消息内容,
    timestamp: Date.now()
}
```

6. **error** - 错误消息
```javascript
{
    type: 'error',
    message: '错误描述',
    timestamp: Date.now()
}
```

## HTTP API 使用

### 1. 获取连接状态

```bash
GET /ws/status
```

响应：
```json
{
    "connected": 2,
    "clients": [
        {"id": 1, "isAlive": true},
        {"id": 2, "isAlive": true}
    ],
    "timestamp": 1703123456789
}
```

### 2. 发送广播消息

```bash
POST /ws/broadcast
Content-Type: application/json

{
    "message": "这是一条广播消息",
    "data": {"key": "value"}
}
```

响应：
```json
{
    "sent": 2,
    "message": "广播消息已发送"
}
```

### 3. 发送点对点消息

```bash
POST /ws/send
Content-Type: application/json

{
    "clientId": 1,
    "message": "这是一条点对点消息"
}
```

响应：
```json
{
    "sent": true,
    "message": "消息已发送给客户端 1"
}
```

## 服务器端API

### 导出函数

1. **broadcast(data)** - 广播消息给所有客户端
2. **sendTo(predicate, data)** - 发送消息给满足条件的客户端
3. **getClientCount()** - 获取当前连接数
4. **getClients()** - 获取所有客户端信息

### 使用示例

```typescript
import { broadcast, sendTo, getClientCount } from './routes/websocket';

// 广播消息
broadcast({
    type: 'notification',
    message: '系统通知',
    timestamp: Date.now()
});

// 发送给特定客户端
sendTo(
    (client) => client.id === 1,
    {
        type: 'private_message',
        message: '私信内容'
    }
);

// 获取连接数
const count = getClientCount();
console.log(`当前连接数: ${count}`);
```

## 与SSE的对比

| 特性 | WebSocket | SSE |
|------|-----------|-----|
| 连接方式 | 双向 | 单向（服务器到客户端） |
| 协议 | ws:// 或 wss:// | HTTP |
| 消息格式 | 自定义JSON | 特定格式 |
| 心跳机制 | 内置ping/pong | 需要手动实现 |
| 浏览器支持 | 现代浏览器 | 现代浏览器 |
| 实时性 | 极高 | 高 |

## 注意事项

1. WebSocket连接会自动进行心跳检测，30秒无响应会自动断开
2. 消息必须使用JSON格式
3. 客户端断开连接后会自动清理相关资源
4. 支持多客户端同时连接
5. 错误处理机制完善，会自动处理连接异常

## 故障排除

### 连接失败
- 检查服务器是否正常运行
- 确认端口3000未被占用
- 检查防火墙设置

### 消息发送失败
- 确认WebSocket连接状态为OPEN
- 检查消息格式是否为有效JSON
- 查看服务器控制台错误日志

### 心跳检测问题
- 检查网络连接稳定性
- 确认客户端正确处理ping/pong消息
- 查看服务器日志中的连接状态
