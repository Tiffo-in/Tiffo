const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tiffo API Documentation',
      version: '1.0.0',
      description: 'API for Tiffo tiffin platform including auth, subscriptions, and payments.',
      contact: {
        name: 'Tiffo Support',
        email: 'help@tiffo.in',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'https://tiffo.in/api' : 'http://localhost:5001/api',
        description: 'Primary API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/models/*.js'], // files containing annotations
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
