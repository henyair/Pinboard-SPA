FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copying from /browser because Angular 17+ app builder nests browser files there
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
# Also try standard path just in case the builder is older
# RUN cp -r /app/dist/frontend/* /usr/share/nginx/html 2>/dev/null || true
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
