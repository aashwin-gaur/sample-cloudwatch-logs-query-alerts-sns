import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SNSClient } from '@aws-sdk/client-sns';
import DLQProcessor from './DLQProcessor';
import EventProcessor from './EventProcessor';
import EmailService from '../services/EmailService';
import LogRetreivalService from '../services/LogRetreivalService';


const cloudwatchLogsClient = new CloudWatchLogsClient({});
const snsClient = new SNSClient({});
const sqsClient = new SQSClient({});

const emailService = new EmailService(snsClient);
const logRetreivalService = new LogRetreivalService(cloudwatchLogsClient);

const eventProcessor = new EventProcessor(logRetreivalService, emailService);
const dlqProcessor = new DLQProcessor(sqsClient, eventProcessor);


export const dependencies = {
    eventProcessor,dlqProcessor
} 