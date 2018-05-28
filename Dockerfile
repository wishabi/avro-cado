FROM node:9

#Copy Application code to app folder
RUN mkdir -p /usr/src/app
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app
WORKDIR /usr/src/app

RUN npm install
COPY . /usr/src/app

#Start Command
CMD ["npm", "test"]
