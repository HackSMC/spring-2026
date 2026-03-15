# Use an official Nginx runtime as a parent image
FROM nginx:stable-alpine

# Accept build argument
ARG IS_PRODUCTION=false

# Copy the base nginx.conf file (that separates stream from http)
COPY nginx.conf/nginx.conf /etc/nginx/nginx.conf

# Copy template files into /etc/nginx/templates (for dynamic config generation if needed)
COPY nginx.conf/*.template /etc/nginx/templates/

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]