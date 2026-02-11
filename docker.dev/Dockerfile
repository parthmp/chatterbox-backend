FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon globally for hot reload
RUN npm install -g nodemon

# Copy source code
COPY src/ ./src/

EXPOSE 3000

# Development mode with hot reload
CMD ["npm", "run", "dev"]
