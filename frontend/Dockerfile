# Step 1: Build the React app
FROM node:22-alpine as build-stage

WORKDIR /app

# Declare build arguments BEFORE copying code
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID

# Set them as environment variables so Vite can read them during build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code and build
COPY . .

# Build the app (Vite will embed the env vars into the bundle)
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy the build output from the build stage to Nginx's serve directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy a custom nginx config to handle React Router (Single Page App)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
