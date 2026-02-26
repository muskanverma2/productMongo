// const serverless = require('serverless-http');
// const app = require('../../app');
// const connectDB = require('../config/db');


// let dbConnected = false;


// const serverlessHandler = serverless(app, {
//   binary: ['image/*', 'application/pdf']
// });

// const handler = async (event, context) => {
 
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


//   return await serverlessHandler(event, context);
// };

// module.exports = { handler };
const serverless = require('serverless-http');
const app = require('../../app');
const connectDB = require('../config/db');

// Create serverless handler once
const serverlessHandler = serverless(app, {
  binary: ['image/*', 'application/pdf']
});

const handler = async (event, context) => {

  // ⭐ Important for MongoDB in Lambda
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
