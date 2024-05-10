import CloudWatchLogsInsights from './CloudWatchLogsInsights';
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { SNSClient } from '@aws-sdk/client-sns';
import SNSMailer from './SNSMailer';
import { config, Event } from './config';

class EventProcessor {

    private cwLogs: CloudWatchLogsInsights;

    private snsMailer: SNSMailer

    constructor(cloudwatchLogsClient: CloudWatchLogsClient, snsClient: SNSClient) {
        this.cwLogs = new CloudWatchLogsInsights(cloudwatchLogsClient);
        this.snsMailer = new SNSMailer(snsClient);
    }

    public async processEvent(event: Event, queryString: string) : Promise<any>{
        // Process the current EventBridge event
        const logEvents = await this.cwLogs.processEvent(config.LOG_GROUP_NAME, queryString, new Date(event.time));
        console.log(logEvents);

        // Send the log events as an SNS email
        console.log("Email sent!")
        // return await this.snsMailer.sendEmail(logEvents, config.SNS_TOPIC_ARN);
    }

}

export default EventProcessor;
