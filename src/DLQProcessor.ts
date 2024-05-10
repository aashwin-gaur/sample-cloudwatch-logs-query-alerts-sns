import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, ReceiveMessageCommandOutput, Message } from '@aws-sdk/client-sqs';
import { config, Event } from './config';
import EventProcessor from './EventProcessor';
import QUERY from './query';

class DLQProcessor {
    private client: SQSClient;
    private eventProcessor: EventProcessor;

    constructor(client: SQSClient, eventProcessor: EventProcessor) {
        this.client = client;
        this.eventProcessor = eventProcessor;
    }

    async processMessages() {
        const params = {
            QueueUrl: config.DLQ_URL,
            MaxNumberOfMessages: config.DLQ_MAX_MESSAGES_TO_PROCESS,
            WaitTimeSeconds: config.DLQ_WAIT_TIME_SECONDS
        };

        try {
            const receiveMessageCommand = new ReceiveMessageCommand(params);
            const data: ReceiveMessageCommandOutput = await this.client.send(receiveMessageCommand);
            const messages: Message[] = data.Messages || [];
            console.log(`Found ${messages.length} messages in the DLQ.`)
            if (messages) {
                for (const message of messages) {
                    // Process each message
                    const processedMessage = await this.processMessage(message);
                    await this.deleteMessage(config.DLQ_URL, message.ReceiptHandle!);
                }
                // If the number of received messages is equal to the requested MaxNumberOfMessages, retry
                if (messages.length === config.DLQ_MAX_MESSAGES_TO_PROCESS) {
                    await this.processMessages();
                }
            }
        } catch (err) {
            console.error("Error processing DLQ messages:", err);
            throw err;
        }
    }

    private async processMessage(message: Message): Promise<any> {
        // Extract data from the message and process it
        const event: Event = JSON.parse((JSON.parse(message.Body!)).Payload!);
        console.log(`Found DLQ message for Payload : ${JSON.stringify(event)}`)
        return this.eventProcessor.processEvent(event, QUERY);
    }

    private async deleteMessage(dlqUrl: string, receiptHandle: string) {
        const params = {
            QueueUrl: dlqUrl,
            ReceiptHandle: receiptHandle
        };

        try {
            const deleteMessageCommand = new DeleteMessageCommand(params);
            await this.client.send(deleteMessageCommand);
            console.log("DLQ message deleted after successful processing.")
        } catch (err) {
            console.error("Error deleting DLQ message:", err);
            throw err;
        }
    }
}

export default DLQProcessor;
