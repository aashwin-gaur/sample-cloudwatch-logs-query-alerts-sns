import LogRetreivalService from '../services/LogRetreivalService';
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { SNSClient } from '@aws-sdk/client-sns';
import EmailService from '../services/EmailService';
import { config, Event } from '../config';
import { MappedLogEvent } from '../types';
class EventProcessor {

    private cwLogs: LogRetreivalService;

    private snsMailer: EmailService

    constructor(cloudwatchLogsClient: CloudWatchLogsClient, snsClient: SNSClient) {
        this.cwLogs = new LogRetreivalService(cloudwatchLogsClient);
        this.snsMailer = new EmailService(snsClient);
    }

    async processEvent(event: Event, queryString: string) : Promise<any>{
        // Process the current EventBridge event
        const logEvents: MappedLogEvent[] = await this.cwLogs.processEvent(config.LOG_GROUP_NAME, queryString, new Date(event.time));
        console.log(logEvents);

        // Send the log events as an SNS email
        return await this.snsMailer.sendEmail(logEvents, config.SNS_TOPIC_ARN);
    }

}

export default EventProcessor;
