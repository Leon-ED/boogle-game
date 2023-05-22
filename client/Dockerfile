# Declare the base image
FROM node:18-alpine
# Build step
# 1. copy package.json and package-lock.json to /app dir
RUN mkdir /app
COPY package*.json /app
# 2. Change working directory to newly created app dir
WORKDIR /app
# 3 . Install dependencies
RUN npm ci
# 4. Copy the source code to /app dir
COPY . .
#4.5 create the node_modules folder
RUN npm install
# 5. Expose port 3000 on the container
RUN apk update && apk add nano
EXPOSE 8080
# 6. Run the app
CMD ["npm", "run", "dev"]z