import { SNSClient, PublishCommand, PublishBatchCommandInput, PublishCommandInput } from '@aws-sdk/client-sns';
import { LogsQueryResult } from '../types';
import { env } from 'process';

class EmailService {
    private BATCH_SIZE = 100; //limited to 100 due to the 256 KB limit on SNS emails.
    private client: SNSClient;

    constructor(client: SNSClient) {
        this.client = client;
    }

    async sendEmail(queryResult: LogsQueryResult) {
        const logEvents = queryResult.logEvents; 
        const batches: any[] = [];
        for (let i = 0; i < logEvents.length; i += this.BATCH_SIZE) {
            batches.push(logEvents.slice(i, i + this.BATCH_SIZE));
        }

        for (const batch of batches) {
            const email = {Message: "test", Subject: "test"} as PublishCommandInput;
            await this.sendEmailBatch("sns",email);
        }
        console.log("All email batches sent successfully.");
    }

    private async sendEmailBatch(snsArn: string, email: PublishCommandInput) {
        email.TopicArn = snsArn
        try {
            const publishCommand = new PublishCommand(email);
            await this.client.send(publishCommand);
            console.log("Email sent successfully.");
        } catch (err) {
            console.error("Error sending email batch:", err);
            throw err;
        }
    }
}

export default EmailService;
