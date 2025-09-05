### 第一阶段：构建生产环境静态文件
FROM --platform=linux/arm/v7 node:22-alpine as builder

WORKDIR /app

# 复制依赖配置
COPY package*.json ./

# 安装所有依赖（包括开发依赖，用于构建）
RUN npm install

# 复制源代码
COPY . .

# 执行构建命令（对应 scripts 中的 "build"，包含类型检查和打包）
RUN npm run build


### 第二阶段：用 Nginx 部署
FROM --platform=linux/arm/v7 nginx:alpine

# 从构建阶段复制打包后的 dist 目录到 Nginx 静态目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 解决 Vue Router history 模式刷新 404 问题（可选但推荐）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口（Nginx 默认端口）
EXPOSE 80

# 启动 Nginx（前台运行）
CMD ["nginx", "-g", "daemon off;"]
    