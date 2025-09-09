###第三版
# 构建阶段 - 前端
FROM node:20-alpine AS frontend-build
WORKDIR /app
# 设置生产环境的环境变量
ENV VITE_WS_URL=/ws
COPY addOnDemoClient/package*.json ./
RUN echo "安装前端依赖..." && \
    npm config set registry https://registry.npmmirror.com && \
    npm install --no-audit --prefer-offline --ignore-scripts
COPY addOnDemoClient/ ./
RUN npm run build

# 构建阶段 - 后端
FROM node:20-alpine AS backend-build
WORKDIR /app
RUN apk add --no-cache python3 make g++ sqlite sqlite-dev
COPY addOnDemoServer/package*.json ./
RUN echo "安装后端依赖..." && \
    npm cache clean --force && \
    npm config set registry https://registry.npmmirror.com && \
    npm install --no-audit --prefer-offline --ignore-scripts
COPY addOnDemoServer/ ./
RUN npm run build

# 最终镜像
FROM node:20-alpine
WORKDIR /app

# 安装系统依赖和进程管理工具
RUN apk add --no-cache python3 make g++ sqlite sqlite-dev nginx supervisor

# 复制后端依赖和构建结果
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist

# 重新构建 sqlite3 原生模块 - 添加这一行
RUN npm rebuild sqlite3

# 复制前端构建结果到Nginx目录
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# 复制配置文件
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

# 创建数据库目录并设置权限
# RUN mkdir -p /app/data && chown -R node:node /app/data && chmod 777 /app/data
RUN mkdir -p /app/data && chmod 777 /app/data

# 暴露端口
EXPOSE 3000

# 使用Supervisor启动所有服务
CMD ["supervisord", "-c", "/etc/supervisord.conf"]