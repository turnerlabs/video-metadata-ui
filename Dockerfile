from node:8.1.4

WORKDIR /opt/gui
ADD . .
RUN npm install

# run the API
CMD [ "node", "/opt/gui/index.js" ]
