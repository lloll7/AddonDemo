const express = require("express");
const cors = require("cors");

const app = express();
// 端口号
const port = 3000;
// 接入cors模块
app.use(cors());

app.get("/sse", (req, res) => {
  // 设置响应头
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // 推送消息
  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // 设置定时器，每秒推送一次
  const intervalId = setInterval(() => {
    sendEvent({ message: "Hello from SSE!", timestamp: new Date() });
  }, 1000);
  // 监听请求关闭事件
  req.on("close", () => {
    clearInterval(intervalId);
    res.end();
  });
});
// 监听端口
app.listen(port, () => {
  console.log(`SSE server running at http://localhost:${port}/sse`);
});
