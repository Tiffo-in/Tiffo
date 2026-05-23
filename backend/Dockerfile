FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Cloud Run sets the PORT environment variable automatically
# We set a default here just in case it's run locally
ENV PORT=5001
EXPOSE 5001

# Start the Node.js application
CMD [ "npm", "start" ]
