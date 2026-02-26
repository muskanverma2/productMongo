# AWS SAM Lambda Deployment Guide

This project has been converted to AWS Lambda using AWS SAM (Serverless Application Model).

## Prerequisites

1. **AWS CLI** - Install and configure with your AWS credentials
   ```bash
   aws configure
   ```

2. **AWS SAM CLI** - Install SAM CLI
   - Windows: Download from [AWS SAM CLI releases](https://github.com/aws/aws-sam-cli/releases)
   - Mac: `brew install aws-sam-cli`
   - Linux: Follow [official installation guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

3. **Node.js** - Version 20.x or higher

4. **MongoDB** - Your MongoDB connection string (will be set as environment variable)

## Project Structure

```
.
├── template.yaml          # SAM template defining Lambda functions and API Gateway
├── samconfig.toml        # SAM deployment configuration
├── src/
│   ├── handlers/        # Lambda handler functions
│   │   ├── main.js      # Main handler (root routes)
│   │   ├── product.js   # Product routes handler
│   │   ├── availability.js
│   │   ├── recurrence.js
│   │   └── gygAvailability.js
│   ├── controllers/     # Express controllers (unchanged)
│   ├── routes/          # Express routes (unchanged)
│   ├── services/        # Business logic (unchanged)
│   ├── models/          # Mongoose models (unchanged)
│   └── config/
│       └── db.js        # MongoDB connection (updated for Lambda)
└── package.json
```

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env` file (for local testing):
```
MONGO_URI=mongodb://localhost:27017/gyg_product
NODE_ENV=development
```

### 3. Run Locally with SAM
```bash
# Start local API Gateway
npm run sam:local

# Or use SAM CLI directly
sam local start-api
```

The API will be available at `http://localhost:3000`

### 4. Test Locally
```bash
# Test root endpoint
curl http://localhost:3000/

# Test product endpoint
curl http://localhost:3000/v1/product
```

## Build and Deploy

### 1. Build the SAM Application
```bash
npm run sam:build
# Or
sam build
```

This will:
- Install dependencies
- Package your code
- Create deployment artifacts in `.aws-sam/build/`

### 2. Validate Template
```bash
npm run sam:validate
# Or
sam validate
```

### 3. Deploy to AWS

#### First-time Deployment (Guided)
```bash
npm run sam:deploy
# Or
sam deploy --guided
```

This will prompt you for:
- Stack name (default: `gyg-product-lambda`)
- AWS Region
- MongoDB URI (or use default)
- Stage (dev/staging/prod)
- Confirm changes before deploy
- Allow SAM CLI to create IAM roles

#### Subsequent Deployments
```bash
sam deploy
```

### 4. Update Environment Variables

Edit `samconfig.toml` to update MongoDB URI:
```toml
parameter_overrides = [
    "MongoUri=your-mongodb-connection-string",
    "Stage=dev"
]
```

Or pass via command line:
```bash
sam deploy --parameter-overrides MongoUri="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
```

## API Endpoints

After deployment, you'll get an API Gateway URL. All endpoints are available:

- **Root**: `GET /`
- **Products**: 
  - `GET /v1/product`
  - `POST /v1/product`
  - `GET /v1/product/:id`
  - `PUT /v1/product/:id`
  - `DELETE /v1/product/:id`
- **Availability**: `/v1/availability/*`
- **Recurrence**: `/v1/recurrence/*`
- **GYG Availability**: `/v1/gygAvailability/*`

## Lambda Functions

The application is split into multiple Lambda functions:

1. **MainLambdaFunction** - Handles root routes
2. **ProductLambdaFunction** - Handles `/v1/product/*` routes
3. **AvailabilityLambdaFunction** - Handles `/v1/availability/*` routes
4. **RecurrenceLambdaFunction** - Handles `/v1/recurrence/*` routes
5. **GygAvailabilityLambdaFunction** - Handles `/v1/gygAvailability/*` routes

## Configuration

### MongoDB Connection

The MongoDB connection is optimized for Lambda:
- Connection is cached between invocations
- Automatic reconnection handling
- Connection pooling

Set `MONGO_URI` in:
- `samconfig.toml` (for deployment)
- Lambda environment variables (via AWS Console)

### Environment Variables

All Lambda functions share these environment variables:
- `MONGO_URI` - MongoDB connection string
- `NODE_ENV` - Set to `production` in Lambda

## Monitoring and Logs

### View Logs
```bash
# View logs for a specific function
sam logs -n MainLambdaFunction --stack-name gyg-product-lambda --tail

# View logs for all functions
sam logs --stack-name gyg-product-lambda --tail
```

### CloudWatch
- Logs: AWS CloudWatch Logs
- Metrics: AWS CloudWatch Metrics
- Traces: AWS X-Ray (if enabled)

## Troubleshooting

### Build Issues
```bash
# Clean build artifacts
rm -rf .aws-sam/
sam build --use-container  # Use Docker container for consistent builds
```

### Deployment Issues
```bash
# Check AWS credentials
aws sts get-caller-identity

# Validate template
sam validate

# Check CloudFormation stack
aws cloudformation describe-stacks --stack-name gyg-product-lambda
```

### Connection Issues
- Verify MongoDB URI is correct
- Check MongoDB network access (IP whitelist, VPC)
- Ensure Lambda has network access (VPC configuration if needed)

## Cost Optimization

- **Cold Starts**: First request may be slower (~1-2s)
- **Warm Containers**: Subsequent requests are faster
- **Memory**: Adjust in `template.yaml` (default: 512MB)
- **Timeout**: Adjust in `template.yaml` (default: 30s)

## Cleanup

To delete all AWS resources:
```bash
sam delete --stack-name gyg-product-lambda
```

## Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
