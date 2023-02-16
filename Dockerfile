FROM node:18-alpine
ARG COMMAND="node"
RUN apk update
WORKDIR /app
COPY package.json /app
RUN npm install
RUN if [ "$COMMAND" = "nodemon" ] ; then npm install -g nodemon; else echo "Production."; fi
COPY . /app
ENV COMMAND $COMMAND
CMD $COMMAND src/index
EXPOSE 3099