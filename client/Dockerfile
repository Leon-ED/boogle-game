# Declare the base image
FROM node:18-alpine

# Create the app directory
RUN mkdir /app
WORKDIR /app

# Copy package.json and package-lock.json to /app directory
COPY package*.json /app/

# Install dependencies
RUN npm ci

# Copy the source code to /app directory
COPY . .

# Create the node_modules folder
RUN npm install

# Expose port 8080 on the container
EXPOSE 8080

# Run the app
CMD ["npm", "run", "dev"]
