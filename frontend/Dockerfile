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

# Copy nginx config as a TEMPLATE (contains $PORT placeholder)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Railway sets PORT dynamically; default to 80 for local Docker
ENV PORT=80

# Expose the port
EXPOSE ${PORT}

# Use envsubst to replace $PORT in the nginx template, then start nginx
CMD sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
