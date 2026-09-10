FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm cache clean --force && npm install --omit=dev --force
COPY . .
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
VOLUME ["/app/data"]
CMD ["npm","start"]
