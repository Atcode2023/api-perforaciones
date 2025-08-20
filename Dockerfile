# Common build stage
FROM node:18.20.2 as common-build-stage

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# bcrypt may need native build inside container
RUN npm install bcrypt@latest --build-from-source || npm install bcrypt@latest --build-from-source --unsafe-perm
RUN npm install

# Copy the rest of the source
COPY . ./

EXPOSE 3000

# Development build stage
FROM common-build-stage as development-build-stage

ENV NODE_ENV=development

CMD ["npm", "run", "dev"]

# Production build stage
FROM common-build-stage as production-build-stage

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
