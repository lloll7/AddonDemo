"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcast = broadcast;
exports.sendTo = sendTo;
exports.getClientCount = getClientCount;
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
// 可选：用于广播给所有客户端
var clients = [];
var clientId = 0;
router.get("/stream", function (req, res) {
    // 必须的 SSE 头
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // 如果你有反向代理，可能还需要：res.setHeader("X-Accel-Buffering", "no");
    // 立即发送一次换行，确保连接建立
    res.write(": connected\n\n");
    var id = ++clientId;
    clients.push({ id: id, res: res });
    // 心跳，防止中间层断开（建议 15-30s）
    var heartbeat = setInterval(function () {
        res.write("event: ping\ndata: ".concat(Date.now(), "\n\n"));
    }, 15000);
    // 示例：向当前客户端推送一条欢迎消息
    res.write("data: ".concat(JSON.stringify({ hello: "world", id: id }), "\n\n"));
    req.on("close", function () {
        clearInterval(heartbeat);
        var idx = clients.findIndex(function (c) { return c.id === id; });
        if (idx >= 0)
            clients.splice(idx, 1);
    });
});
// 可选：示例的广播接口（你也可以从其他业务逻辑里触发）
router.post("/broadcast", express_1.default.json(), function (req, res) {
    var _a;
    var payload = (_a = req.body) !== null && _a !== void 0 ? _a : {};
    clients.forEach(function (c) { return c.res.write("data: ".concat(JSON.stringify(payload), "\n\n")); });
    res.json({ sent: clients.length });
});
function broadcast(data, event) {
    var payload = "data: ".concat(JSON.stringify(data), "\n\n");
    var payloadWithEvent = event ? "event: ".concat(event, "\n").concat(payload) : payload;
    clients.forEach(function (c) { return c.res.write(payloadWithEvent); });
}
function sendTo(predicate, data, event) {
    var payload = "data: ".concat(JSON.stringify(data), "\n\n");
    var payloadWithEvent = event ? "event: ".concat(event, "\n").concat(payload) : payload;
    clients.filter(predicate).forEach(function (c) { return c.res.write(payloadWithEvent); });
}
function getClientCount() {
    return clients.length;
}
exports.default = router;
