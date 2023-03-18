FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json /usr/src/app/
RUN npm install


RUN npm i express --save
# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source
RUN npm i nodemon --save
RUN apk update && apk add nano
# install java version 17
RUN apk add --no-cache openjdk17-jre

#add bin/jdict.jar to the path
#install GCC
RUN apk add --no-cache build-base
#install make
RUN apk add --no-cache make
#run the makefile in dictionnary




COPY . /usr/src/app/
RUN make all -C /usr/src/app/dictionnary/
ENV PATH="/usr/src/app/bin/jdict.jar:${PATH}"
EXPOSE 3000
CMD [ "npm","start"]
