// Local tester for the product Lambda handler
// Run with: node test-product-lambda.js

require('dotenv').config();

// Import the product Lambda handler
const { handler } = require('./src/handlers/product');

// Mock API Gateway event for GET /v1/product
const event = {
  httpMethod: 'GET',
  path: '/v1/product',
  headers: {},
  queryStringParameters: null,
  body: null,
  isBase64Encoded: false,
};

// Empty context object is fine for local tests
const context = {};

(async () => {
  try {
    const response = await handler(event, context);
    console.log('Lambda response (product):');
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Lambda error (product):');
    console.error(err);
  }
})();

