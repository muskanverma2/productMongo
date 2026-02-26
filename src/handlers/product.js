// const serverless = require('serverless-http');
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('../config/db');
// const productRoute = require('../routes/v1/product.routes');

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use('/v1/product', productRoute);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({ status: 'ok', service: 'product' });
// });

// // Create serverless handler once (reused across invocations)
// const serverlessHandler = serverless(app, {
//   binary: ['image/*', 'application/pdf']
// });

// // Initialize DB connection
// let dbConnected = false;

// console.log("muskanvvvvvvvvvvvvvv")
// const handler = async (event, context) => {
//   // Connect to MongoDB if not already connected
//   console.log("muskan")
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
const productRoute = require('../routes/v1/product.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/v1/product', productRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product' });
});

// Create serverless handler once
const serverlessHandler = serverless(app, {
  binary: ['image/*', 'application/pdf']
});

console.log("muskanvvvvvvvvvvvvvv");

const handler = async (event, context) => {

  console.log("muskan");

  // ⭐ VERY IMPORTANT for MongoDB in Lambda
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

