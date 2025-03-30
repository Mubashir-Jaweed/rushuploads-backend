/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["DB_PASSWORD"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	NODE_ENV
	PORT
	JWT_SECRET
	JWT_EXPIRY
	NODEMAILER_HOST
	NODEMAILER_PORT
	NODEMAILER_SECURE
	NODEMAILER_EMAIL
	NODEMAILER_PASSWORD
	DATABASE_URL
	CLIENT_BASE_URL
	APP_NAME
	APP_SUPPORT_EMAIL
	APP_ADMIN_EMAIL
	AWS_ACCESS_KEY_ID
	AWS_SECRET_ACCESS_KEY
	AWS_BUCKET
	AWS_REGION
	STRIPE_SECRET_KEY
	STRIPE_WEBHOOK_SECRET_KEY
	STRIPE_PRO_PRICE_ID
	STRIPE_PREMIUM_PRICE_ID
	STRIPE_SUCCESS_ENDPOINT
	STRIPE_CANCEL_ENDPOINT
	STRIPE_RETURN_ENDPOINT
	AWS_S3_DISABLE_CHECKSUM
	AWS_REQUEST_CHECKSUM_CALCULATION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    return {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*",
    //      "Access-Control-Allow-Headers": "*"
    //  },
        body: JSON.stringify('Hello from Lambda!'),
    };
};
