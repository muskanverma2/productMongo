// const serverless = require('serverless-http');
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('../config/db');
// const availabilityRoute = require('../routes/v1/availability.route');

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use('/v1/availability', availabilityRoute);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({ status: 'ok', service: 'availability' });
// });

// // Create serverless handler once (reused across invocations)
// const serverlessHandler = serverless(app, {
//   binary: ['image/*', 'application/pdf']
// });

// // Initialize DB connection
// let dbConnected = false;

// const handler = async (event, context) => {
//   // Connect to MongoDB if not already connected
//   if (!dbConnected) {
//     try {
//       await connectDB();
//       dbConnected = true;
//     } catch (error) {
//       console.error('Database connection error:', error);
//       return {
//         statusCode: 500,
//         body: JSON.stringify({
//           success: false,
//           message: 'Database connection failed',
//           error: error.message
//         })
//       };
//     }
//   }

//   // Call the handler
//   return await serverlessHandler(event, context);
// };

// module.exports = { handler };
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

const connectDB = require('../config/db');
const availabilityRoute = require('../routes/v1/availability.route');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/v1/availability', availabilityRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'availability' });
});

// Create serverless handler once (reuse across invocations)
const serverlessHandler = serverless(app, {
  binary: ['image/*', 'application/pdf']
});

// ✅ Cache DB connection between Lambda runs
let dbConnectionPromise;

const handler = async (event, context) => {
  // VERY IMPORTANT for MongoDB in Lambda
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Connect only once (cold start)
    if (!dbConnectionPromise) {
      dbConnectionPromise = connectDB();
    }

    await dbConnectionPromise;

    // Forward request to Express
    return await serverlessHandler(event, context);

  } catch (error) {
    console.error('Database connection error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Database connection failed',
        error: error.message
      })
    };
  }
};

module.exports = { handler };
