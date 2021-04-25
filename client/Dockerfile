FROM node:15.14

LABEL version="1.0"
LABEL description="This is the base docker image for the Spiking Neural Network engine controller frontend react app."
LABEL maintainer = "Louis Ross <louis.ross@gmail.com"

WORKDIR /app

#COPY ["package.json", "package-lock.json", "./"]

#RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
