import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { LogsQueryResult } from '../types';

class EmailService {
    private BATCH_SIZE = 100; //limited to 100 due to the 256 KB limit on SNS emails.
    private client: SNSClient;

    constructor(client: SNSClient) {
        this.client = client;
    }

    async sendEmail(queryResult: LogsQueryResult, snsTopicArn: string) {
        const logEvents = queryResult.logEvents; 
        const batches: any[] = [];
        for (let i = 0; i < logEvents.length; i += this.BATCH_SIZE) {
            batches.push(logEvents.slice(i, i + this.BATCH_SIZE));
        }

        for (const batch of batches) {
            const emailBody = batch.map((logEvent:any, index:any) => `Log Event ${index + 1}:\nEvent Time: ${logEvent.eventTime}\nMessage: ${logEvent.message}\n\n`).join('\n');
            await this.sendEmailBatch(emailBody, snsTopicArn);
        }
        console.log("All email batches sent successfully.");
    }

    private async sendEmailBatch(emailBody: string, snsTopicArn: string) {
        const params = {
            Message: emailBody,
            Subject: 'CloudWatch Logs Insights Query Results',
            TopicArn: snsTopicArn
        };
        try {
            const publishCommand = new PublishCommand(params);
            await this.client.send(publishCommand);
            console.log("Email sent successfully.");
        } catch (err) {
            console.error("Error sending email batch:", err);
            throw err;
        }
    }
}

export default EmailService;
