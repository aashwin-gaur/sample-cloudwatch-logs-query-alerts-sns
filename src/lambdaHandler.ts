import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SNSClient } from '@aws-sdk/client-sns';
import CloudWatchLogsInsights from './CloudWatchLogsInsights';
import DLQProcessor from './DLQProcessor';
import SNSMailer from './SNSMailer';

const LOG_GROUP_NAME = process.env.LOG_GROUP_NAME!;
const DLQ_URL = process.env.DLQ_URL!;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN!;

const cloudwatchLogsClient = new CloudWatchLogsClient({});
const sqsClient = new SQSClient({});
const snsClient = new SNSClient({});

const cwLogs = new CloudWatchLogsInsights(cloudwatchLogsClient);
const dlqProcessor = new DLQProcessor(sqsClient);
const snsMailer = new SNSMailer(snsClient);

const FILTER_PATTERN = 'eventSource = "s3.amazonaws.com" and (userIdentity.type != "AWSService" and userIdentity.invokedBy != "cloudtrail.amazonaws.com")';
const QUERY = `fields @timestamp, @log, @logStream, eventSource, eventTime,eventType, userIdentity.arn,userIdentity.principalId, requestParameters.bucketName,resources.0.ARN,resources.0.accountId,sourceIPAddress,managementEvent,readOnly
                | filter ${FILTER_PATTERN}
                | sort @timestamp desc
                | limit 300`; // Adjust limit as needed

export async function lambdaHandler(event: any, context: any) {
    try {
        // Process the current EventBridge event
        const logEvents = await cwLogs.processEvent(LOG_GROUP_NAME, QUERY);
        
        // Send the log events as an SNS email
        await snsMailer.sendEmail(logEvents, SNS_TOPIC_ARN);

        // Process messages from DLQ
        await dlqProcessor.processMessages(DLQ_URL);

        return { statusCode: 200, body: JSON.stringify(logEvents) };
    } catch (err) {
        console.error("Error:", err);
        throw err;
    }
}
