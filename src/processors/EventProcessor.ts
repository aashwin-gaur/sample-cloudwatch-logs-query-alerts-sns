import LogRetreivalService from '../services/LogRetreivalService';
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { SNSClient } from '@aws-sdk/client-sns';
import EmailService from '../services/EmailService';
import { config, Event } from '../config';
import { LogsQueryResult } from '../types';
class EventProcessor {

    private TIME = (2 * 24 * 5) * config.DURATION_TO_QUERY_MINS * 60 * 1000;  // 48 hours before endTime
    
    private logRetreivalService: LogRetreivalService;
    private emailService: EmailService;

    constructor(logRetreivalService: LogRetreivalService, emailService: EmailService) {
        this.logRetreivalService = logRetreivalService;
        this.emailService = emailService;
    }

    async processEvent(event: Event) : Promise<any>{
        const endTime = new Date(event.time)
        const startTime = new Date(endTime.getTime() - this.TIME);

        const queryResult: LogsQueryResult = await this.logRetreivalService.processEvent(config.LOG_GROUP_NAME, queryString,startTime,endTime);

        // Send the log events as an SNS email
        return await this.emailService.sendEmail(queryResult, config.SNS_TOPIC_ARN);
    }

}

export default EventProcessor;
