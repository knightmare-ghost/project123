FROM node:22.16.0-alpine

WORKDIR /app

# Install any needed packages specified in requirements.txt
ADD . /app

RUN npm install --force


RUN npm run build

EXPOSE 3000
