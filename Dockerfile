# To build use: docker build -t xosproject/xos-rest-gw .
# To run use: docker run -p 3000:3000 -d xosproject/xos-rest-gw

FROM node:argon

# Set environment variables
ENV CODE_SOURCE .
ENV CODE_DEST /var/www

# Create app directory
WORKDIR ${CODE_DEST}

# Install app dependencies
COPY ${CODE_SOURCE}/package.json ${CODE_DEST}
RUN npm install --production

# Bundle app source
COPY ${CODE_SOURCE}/src ${CODE_DEST}/src

# Create a folder for logs
RUN mkdir ${CODE_DEST}/logs

EXPOSE 3000
CMD [ "npm", "start" ]