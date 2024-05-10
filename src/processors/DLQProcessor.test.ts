import { SQSClient } from '@aws-sdk/client-sqs';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import DLQProcessor from './DLQProcessor';
import EventProcessor from './EventProcessor';
import { config } from '../config';

describe('DLQProcessor', () => {
    let sqsClient: SQSClient;
    let eventProcessor: EventProcessor;
    let dlqProcessor: DLQProcessor;
    let receiveMessageStub: SinonStub;
    let deleteMessageStub: SinonStub;

    beforeEach(() => {
        sqsClient = new SQSClient({ region: 'us-east-1' });
        eventProcessor = new EventProcessor(_,_);
        dlqProcessor = new DLQProcessor(sqsClient, eventProcessor);
        receiveMessageStub = sinon.stub(sqsClient, 'send');
        deleteMessageStub = sinon.stub(sqsClient, 'send');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('processMessages', () => {
        it('should process messages from DLQ and delete them', async () => {
            const messages = [
                { Body: JSON.stringify({ Payload: '{"key": "value"}' }), ReceiptHandle: 'receipt1' },
                { Body: JSON.stringify({ Payload: '{"key": "value"}' }), ReceiptHandle: 'receipt2' }
            ];

            receiveMessageStub.onFirstCall().resolves({ Messages: messages });
            receiveMessageStub.onSecondCall().resolves({ Messages: [] });

            await dlqProcessor.processMessages();

            expect(receiveMessageStub.calledTwice).to.be.true;
            expect(receiveMessageStub.getCall(0).args[0].QueueUrl).to.equal(config.DLQ_URL);
            expect(receiveMessageStub.getCall(1).args[0].QueueUrl).to.equal(config.DLQ_URL);
            expect(deleteMessageStub.calledTwice).to.be.true;
            expect(deleteMessageStub.getCall(0).args[0].QueueUrl).to.equal(config.DLQ_URL);
            expect(deleteMessageStub.getCall(1).args[0].QueueUrl).to.equal(config.DLQ_URL);
            expect(deleteMessageStub.getCall(0).args[0].ReceiptHandle).to.equal(messages[0].ReceiptHandle);
            expect(deleteMessageStub.getCall(1).args[0].ReceiptHandle).to.equal(messages[1].ReceiptHandle);
        });

        it('should retry if the number of messages received equals the configured maximum', async () => {
            const messages = [
                { Body: JSON.stringify({ Payload: '{"key": "value"}' }), ReceiptHandle: 'receipt1' },
                { Body: JSON.stringify({ Payload: '{"key": "value"}' }), ReceiptHandle: 'receipt2' }
            ];

            receiveMessageStub.onFirstCall().resolves({ Messages: messages });
            receiveMessageStub.onSecondCall().resolves({ Messages: messages });

            await dlqProcessor.processMessages();

            expect(receiveMessageStub.calledTwice).to.be.true;
        });

        it('should handle errors', async () => {
            receiveMessageStub.rejects(new Error('Error receiving messages'));

            try {
                await dlqProcessor.processMessages();
            } catch (error) {
                expect(error.message).to.equal('Error receiving messages');
                expect(receiveMessageStub.calledOnce).to.be.true;
                expect(deleteMessageStub.called).to.be.false;
            }
        });
    });
});