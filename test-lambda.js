// Simple local tester for your Lambda handler
// Run with: node test-lambda.js

require('dotenv').config();

// Import the Lambda handler
const { handler } = require('./src/handlers/main');

// Mock API Gateway event for GET /
const event = {
  httpMethod: 'GET',
  path: '/',
  headers: {},
  queryStringParameters: null,
  body: null,
  isBase64Encoded: false,
};

// Empty context object is fine for basic tests
const context = {};

(async () => {
  try {
    const response = await handler(event, context);
    console.log('Lambda response:');
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Lambda error:');
    console.error(err);
  }
})();

