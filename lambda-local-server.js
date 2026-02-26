// Local HTTP server that forwards requests to your Lambda handler
// Run with: node lambda-local-server.js

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const { handler } = require('./src/handlers/main'); // Lambda handler

const app = express();
const PORT = process.env.LAMBDA_PORT || 5000; // same as your old port if you want

app.use(bodyParser.json());

// Forward every request to the Lambda handler (catch-all middleware)
app.use(async (req, res) => {
  try {
    const event = {
      httpMethod: req.method,
      path: req.path,
      headers: req.headers,
      queryStringParameters: Object.keys(req.query).length ? req.query : null,
      body: req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : null,
      isBase64Encoded: false,
    };

    const context = {};

    const lambdaResponse = await handler(event, context);

    // Apply status, headers, and body from Lambda response
    res.status(lambdaResponse.statusCode || 200);

    if (lambdaResponse.headers) {
      Object.entries(lambdaResponse.headers).forEach(([key, value]) => {
        if (value !== undefined) {
          res.setHeader(key, value);
        }
      });
    }

    if (lambdaResponse.isBase64Encoded) {
      // For simplicity, treat as text here; extend if you need binary
      res.send(Buffer.from(lambdaResponse.body, 'base64'));
    } else {
      res.send(lambdaResponse.body);
    }
  } catch (err) {
    console.error('Error invoking local Lambda:', err);
    res.status(500).json({ message: 'Error invoking local Lambda', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Local Lambda HTTP server running on http://localhost:${PORT}`);
});

