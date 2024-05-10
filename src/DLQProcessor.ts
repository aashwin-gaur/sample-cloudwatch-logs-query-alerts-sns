import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, ReceiveMessageCommandOutput } from '@aws-sdk/client-sqs';

class DLQProcessor {
    private client: SQSClient;

    constructor(client: SQSClient) {
        this.client = client;
    }

    async processMessages(dlqUrl: string) {
        const params = {
            QueueUrl: dlqUrl,
            MaxNumberOfMessages: 10
        };

        try {
            const receiveMessageCommand = new ReceiveMessageCommand(params);
            const data: ReceiveMessageCommandOutput = await this.client.send(receiveMessageCommand);

            if (data.Messages) {
                for (const message of data.Messages) {
                    // Process each message
                    const processedMessage = await this.processMessage(message);

                    // If message processed successfully, delete it from the DLQ
                    if (processedMessage) {
                        await this.deleteMessage(dlqUrl, message.ReceiptHandle!);
                    }
                }
            }
        } catch (err) {
            console.error("Error processing DLQ messages:", err);
            throw err;
        }
    }

    private async processMessage(message: any): Promise<boolean> {
        // Extract data from the message and process it
        const eventData = JSON.parse(message.Body!);
        // Example: const eventId = eventData.eventId;

        // Perform your processing here
        // You can reuse the function 'processCurrentEvent' by passing appropriate eventData

        return true; // Return true if processing is successful
    }

    private async deleteMessage(dlqUrl: string, receiptHandle: string) {
        const params = {
            QueueUrl: dlqUrl,
            ReceiptHandle: receiptHandle
        };

        try {
            const deleteMessageCommand = new DeleteMessageCommand(params);
            await this.client.send(deleteMessageCommand);
        } catch (err) {
            console.error("Error deleting DLQ message:", err);
            throw err;
        }
    }
}

export default DLQProcessor;
