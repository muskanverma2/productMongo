// const serverless = require('serverless-http');
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('../config/db');
// const gygAvailabilityRoute = require('../routes/v1/gygAvailability.route');

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use('/v1/gygAvailability', gygAvailabilityRoute);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({ status: 'ok', service: 'gygAvailability' });
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
const gygAvailabilityRoute = require('../routes/v1/gygAvailability.route');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/v1/gygAvailability', gygAvailabilityRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gygAvailability' });
});

// Create serverless handler once
const serverlessHandler = serverless(app, {
  binary: ['image/*', 'application/pdf']
});

const handler = async (event, context) => {

  // ⭐ IMPORTANT for MongoDB in Lambda
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // ⭐ ALWAYS ensure DB connection
    await connectDB();

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

  // Call Express app
  return await serverlessHandler(event, context);
};

module.exports = { handler };
