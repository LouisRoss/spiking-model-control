FROM node:15.14

LABEL version="1.0"
LABEL description="Docker image for the Spiking Neural Network engine control panel react app."
LABEL maintainer = "Louis Ross <louis.ross@gmail.com"

WORKDIR /app

COPY ["./package.json", "./package-lock.json", "/app/"]

RUN ls
#RUN npm install --production
RUN ["npm", "install"]

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
