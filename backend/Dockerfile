FROM node:15.14

LABEL version="1.0"
LABEL description="This is the base docker image for the Spiking Neural Network engine controller backend API."
LABEL maintainer = "Louis Ross <louis.ross@gmail.com"

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]
RUN ls
#RUN npm install --production
RUN npm install
COPY . .

EXPOSE 5000

CMD ["node", "backend.js"]
