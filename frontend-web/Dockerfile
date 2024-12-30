# Stage 1: Build the Angular application
FROM node:18 as build

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application (with verbose output for debugging)
RUN npm run build -- --output-path=/usr/src/app/dist/frontend-web

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built application to Nginx's serve directory
COPY --from=build /usr/src/app/dist/frontend-web/* /usr/share/nginx/html/

# Copy custom Nginx configuration if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]