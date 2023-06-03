FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json /app/

# Install app dependencies
RUN npm install

# Install express module
RUN npm i express --save

# Update packages and install nano, java, build-base, and make
RUN apk update && \
    apk add --no-cache nano openjdk17-jre build-base make

# Copy the entire project to the app directory
COPY . .

# Build the makefile in the dictionnary directory
RUN make all -C dictionnary

# Add bin/jdict.jar to the path
ENV PATH="/app/dictionnary/bin:${PATH}"

# Expose port 4000
EXPOSE 4000

# Start the server using nodemon
CMD [ "npx", "nodemon", "server.js", "-L" ]
