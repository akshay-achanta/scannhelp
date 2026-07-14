# Step 1: Build the React app
FROM node:22-alpine as build-stage

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code and build
# Vite will read VITE_API_URL and other vars from .env.production
COPY . .

# Build the app (Vite will embed the env vars from .env.production into the bundle)
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy the build output from the build stage to Nginx's serve directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx config directly (NO template variables - sed handles port at runtime)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove the default nginx entrypoint template processing to avoid conflicts
RUN rm -rf /etc/nginx/templates

# Limit worker processes to avoid OOM on Railway (default 'auto' spawns 50+ workers)
RUN sed -i 's/worker_processes  auto;/worker_processes 2;/' /etc/nginx/nginx.conf

# Railway sets PORT dynamically; default to 80 for local Docker
ENV PORT=80

EXPOSE ${PORT}

# At runtime: replace port 80 with $PORT using sed, then start nginx
CMD sh -c "sed -i \"s/listen 80;/listen ${PORT};/\" /etc/nginx/conf.d/default.conf && sed -i \"s/listen \\\\[::\\\\]:80;/listen \\\\[::\\\\]:${PORT};/\" /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"
