import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SNSClient } from '@aws-sdk/client-sns';
import CloudWatchLogsInsights from './CloudWatchLogsInsights';
import DLQProcessor from './DLQProcessor';
import SNSMailer from './SNSMailer';
import { config, Event } from './config';
import EventProcessor from './EventProcessor';
import QUERY from './query';


const cloudwatchLogsClient = new CloudWatchLogsClient({});
const snsClient = new SNSClient({});
const sqsClient = new SQSClient({});

const eventProcessor = new EventProcessor(cloudwatchLogsClient, snsClient);
const dlqProcessor = new DLQProcessor(sqsClient, eventProcessor);

export async function lambdaHandler(event: Event, context: any) {
    try {
        
        // Process Main Event
        eventProcessor.processEvent(event, QUERY);
        
        // Process messages from DLQ
        await dlqProcessor.processMessages();

        return { statusCode: 200 };
    } catch (err) {
        console.error("Error:", err);
        throw err;
    }

}
