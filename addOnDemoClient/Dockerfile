### 第一阶段：构建生产环境静态文件
FROM node:22-alpine as builder

WORKDIR /app

# 复制依赖定义文件
COPY package*.json ./

# 设置环境变量，告诉 npm 和目标平台是 armv7
ENV npm_config_platform=linux npm_config_arch=armv7

# 安装所有依赖
RUN npm ci --prefer-offline --no-audit --ignore-scripts

# 复制源代码和构建配置
COPY . .

# 分别执行类型检查和构建命令，而不是使用复杂的 npm run build
RUN npm run build

### 第二阶段：用 Nginx 部署
FROM nginx:alpine

# 从构建阶段复制打包后的文件，并更改所有权为 nginx 用户
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# 复制 Nginx 配置文件
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
    