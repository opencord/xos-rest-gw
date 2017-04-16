# To build use: docker build -t xosproject/xos-rest-gw .
# To run use: docker run -p 3000:3000 -d xosproject/xos-rest-gw

FROM node:argon

# label image
ARG org_label-schema_schema-version=1.0
ARG org_label-schema_name=xos-rest-gw
ARG org_label-schema_version=unknown
ARG org_label-schema_vcs-url=unknown
ARG org_label-schema_vcs-ref=unknown
ARG org_label-schema_build-date=unknown
ARG org_opencord_vcs-commit-date=unknown

LABEL org.label-schema.schema-version=$org_label-schema_schema-version \
      org.label-schema.name=$org_label-schema_name \
      org.label-schema.version=$org_label-schema_version \
      org.label-schema.vcs-url=$org_label-schema_vcs-url \
      org.label-schema.vcs-ref=$org_label-schema_vcs-ref \
      org.label-schema.build-date=$org_label-schema_build-date \
      org.opencord.vcs-commit-date=$org_opencord_vcs-commit-date

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
