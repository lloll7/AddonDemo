### 第一阶段：编译 TypeScript 代码
FROM node:22-alpine as builder

# 设置工作目录
WORKDIR /app

# 复制依赖配置
COPY package*.json ./

# 安装所有依赖（包括开发依赖，用于编译 TypeScript）
RUN npm install

# 复制源代码
COPY . .

# 执行编译命令（对应 scripts 中的 "build": "tsc"）
RUN npm run build


### 第二阶段：生产环境运行
FROM node:22-alpine

WORKDIR /app

# 复制依赖配置（仅用于安装生产依赖）
COPY package*.json ./

# 安装生产环境依赖（排除 devDependencies）
RUN npm install --production

# 从构建阶段复制编译后的 dist 目录
COPY --from=builder /app/dist ./dist

# 暴露后端服务端口（根据你的 Express 实际端口修改，如 3000）
EXPOSE 3000

# 启动命令（对应 scripts 中的 "start": "node dist/app.js"）
CMD ["npm", "start"]