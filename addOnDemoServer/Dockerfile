### 第一阶段：编译 TypeScript 代码
FROM node:22-alpine as builder

WORKDIR /app

# 复制依赖定义和构建配置
COPY package*.json ./
COPY tsconfig.json ./
# 设置环境变量，告诉 npm 和目标平台是 armv7
ENV npm_config_platform=linux npm_config_arch=armv7

# 安装所有依赖
RUN npm ci --prefer-offline --no-audit --ignore-scripts

# 复制源代码
COPY . .

# 执行编译
RUN npm run build


### 第二阶段：生产环境运行
FROM node:22-alpine

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app

# 复制生产依赖文件
COPY package*.json ./

# 设置环境变量，告诉 npm 和目标平台是 armv7
ENV npm_config_platform=linux npm_config_arch=armv7

# 安装生产依赖
RUN npm ci --prefer-offline --no-audit --only=production --ignore-scripts

# 从构建阶段复制编译产物，并更改所有权
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# 切换用户
USER nextjs

# 暴露端口和健康检查
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
CMD ["node", "dist/app.js"]