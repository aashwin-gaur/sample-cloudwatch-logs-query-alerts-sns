import LogRetreivalService from '../services/LogRetreivalService';
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { SNSClient } from '@aws-sdk/client-sns';
import EmailService from '../services/EmailService';
import { config, Event } from '../config';
import { LogEvent, LogsQueryResult } from '../types';
class EventProcessor {

    private TIME = (2 * 24 * 5) * config.DURATION_TO_QUERY_MINS * 60 * 1000;  // 48 hours before endTime
    
    private cwLogs: LogRetreivalService;
    private snsMailer: EmailService

    constructor(cloudwatchLogsClient: CloudWatchLogsClient, snsClient: SNSClient) {
        this.cwLogs = new LogRetreivalService(cloudwatchLogsClient);
        this.snsMailer = new EmailService(snsClient);
    }

    async processEvent(event: Event, queryString: string) : Promise<any>{
        // Process the current EventBridge event
        const endTime = new Date(event.time)
        const startTime = new Date(endTime.getTime() - this.TIME);

        const queryResult: LogsQueryResult = await this.cwLogs.processEvent(config.LOG_GROUP_NAME, queryString,startTime,endTime);

        // Send the log events as an SNS email
        return await this.snsMailer.sendEmail(queryResult, config.SNS_TOPIC_ARN);
    }

}

export default EventProcessor;
