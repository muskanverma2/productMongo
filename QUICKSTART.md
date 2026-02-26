# Quick Start Guide - AWS SAM Lambda Deployment

## 🚀 Quick Deployment Steps

### 1. Install Prerequisites
```bash
# Install AWS SAM CLI
# Windows: Download from https://github.com/aws/aws-sam-cli/releases
# Mac: brew install aws-sam-cli
# Linux: Follow AWS documentation

# Verify installation
sam --version
aws --version
```

### 2. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter default output format (json)
```

### 3. Update MongoDB Connection
Edit `samconfig.toml` and update the `MongoUri` parameter:
```toml
parameter_overrides = [
    "MongoUri=your-mongodb-connection-string-here",
    "Stage=dev"
]
```

### 4. Build the Application
```bash
npm install
npm run sam:build
```

### 5. Deploy to AWS
```bash
npm run sam:deploy
# Or for first-time deployment:
sam deploy --guided
```

### 6. Get Your API URL
After deployment, check the outputs:
```bash
aws cloudformation describe-stacks --stack-name gyg-product-lambda --query "Stacks[0].Outputs"
```

The API Gateway URL will be in the `ApiGatewayUrl` output.

## 📝 Testing Your Deployment

```bash
# Test root endpoint
curl https://your-api-id.execute-api.region.amazonaws.com/Prod/

# Test product endpoint
curl https://your-api-id.execute-api.region.amazonaws.com/Prod/v1/product
```

## 🔧 Common Commands

```bash
# Build
npm run sam:build

# Validate template
npm run sam:validate

# Local testing
npm run sam:local

# Deploy
npm run sam:deploy

# View logs
sam logs -n MainLambdaFunction --stack-name gyg-product-lambda --tail

# Delete stack
sam delete --stack-name gyg-product-lambda
```

## 📚 Full Documentation

See [README_SAM.md](./README_SAM.md) for detailed documentation.
