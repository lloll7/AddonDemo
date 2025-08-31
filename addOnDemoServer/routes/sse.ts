import express from "express";

const router = express.Router();

// 可选：用于广播给所有客户端
const clients: Array<{ id: number; res: express.Response }> = [];
let clientId = 0;

router.get("/stream", (req, res) => {
  // 必须的 SSE 头
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // 如果你有反向代理，可能还需要：res.setHeader("X-Accel-Buffering", "no");

  // 立即发送一次换行，确保连接建立
  res.write(": connected\n\n");

  const id = ++clientId;
  clients.push({ id, res });

  // 心跳，防止中间层断开（建议 15-30s）
  const heartbeat = setInterval(() => {
    res.write(`event: ping\ndata: ${Date.now()}\n\n`);
  }, 15000);

  // 示例：向当前客户端推送一条欢迎消息
  res.write(`data: ${JSON.stringify({ hello: "world", id })}\n\n`);

  req.on("close", () => {
    clearInterval(heartbeat);
    const idx = clients.findIndex((c) => c.id === id);
    if (idx >= 0) clients.splice(idx, 1);
  });
});

// 可选：示例的广播接口（你也可以从其他业务逻辑里触发）
router.post("/broadcast", express.json(), (req, res) => {
  const payload = req.body ?? {};
  clients.forEach((c) => c.res.write(`data: ${JSON.stringify(payload)}\n\n`));
  res.json({ sent: clients.length });
});

export function broadcast(data: unknown, event?: string) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  const payloadWithEvent = event ? `event: ${event}\n${payload}` : payload;
  clients.forEach((c) => c.res.write(payloadWithEvent));
}

export function sendTo(
  predicate: (client: { id: number }) => boolean,
  data: unknown,
  event?: string
) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  const payloadWithEvent = event ? `event: ${event}\n${payload}` : payload;
  clients.filter(predicate).forEach((c) => c.res.write(payloadWithEvent));
}

export function getClientCount() {
  return clients.length;
}

export default router;
