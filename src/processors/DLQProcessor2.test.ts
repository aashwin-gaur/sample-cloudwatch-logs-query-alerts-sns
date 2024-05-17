
import { expect } from 'chai';
import sinon from 'sinon';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, Message } from '@aws-sdk/client-sqs';
import DLQProcessor from '../path-to-DLQProcessor';
import EventProcessor from '../path-to-EventProcessor';
import { config, Event } from '../path-to-config';
import QUERY_STRING from '../path-to-query';

describe('DLQProcessor', () => {
    let clientStub: sinon.SinonStubbedInstance<SQSClient>;
    let eventProcessorStub: sinon.SinonStubbedInstance<EventProcessor>;
    let dlqProcessor: DLQProcessor;

    beforeEach(() => {
        clientStub = sinon.createStubInstance(SQSClient);
        eventProcessorStub = sinon.createStubInstance(EventProcessor);
        dlqProcessor = new DLQProcessor(clientStub as unknown as SQSClient, eventProcessorStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('processMessages', () => {
        it('should process messages from the DLQ', async () => {
            const messages: Message[] = [
                { Body: JSON.stringify({ Payload: JSON.stringify({ id: 1 }) }), ReceiptHandle: 'handle1' },
                { Body: JSON.stringify({ Payload: JSON.stringify({ id: 2 }) }), ReceiptHandle: 'handle2' }
            ];

            clientStub.send.resolves({ Messages: messages });

            eventProcessorStub.processEvent.resolves('processed');

            await dlqProcessor.processMessages();

            expect(clientStub.send.calledWith(sinon.match.instanceOf(ReceiveMessageCommand))).to.be.true;
            expect(eventProcessorStub.processEvent.calledTwice).to.be.true;
            expect(clientStub.send.calledWith(sinon.match.instanceOf(DeleteMessageCommand))).to.be.true;
        });

        it('should retry processing if max messages are received', async () => {
            const messages: Message[] = new Array(config.DLQ_MAX_MESSAGES_TO_PROCESS).fill({
                Body: JSON.stringify({ Payload: JSON.stringify({ id: 1 }) }), ReceiptHandle: 'handle1'
            });

            clientStub.send.onFirstCall().resolves({ Messages: messages });
            clientStub.send.onSecondCall().resolves({ Messages: [] });

            await dlqProcessor.processMessages();

            expect(clientStub.send.calledWith(sinon.match.instanceOf(ReceiveMessageCommand))).to.be.true;
            expect(clientStub.send.callCount).to.equal(2); // Ensuring retry
        });

        it('should throw an error if message processing fails', async () => {
            clientStub.send.rejects(new Error('SQS Error'));

            try {
                await dlqProcessor.processMessages();
            } catch (error) {
                expect(error.message).to.equal('SQS Error');
            }
        });
    });

    describe('processMessage', () => {
        it('should process a single message', async () => {
            const message: Message = { Body: JSON.stringify({ Payload: JSON.stringify({ id: 1 }) }) };

            eventProcessorStub.processEvent.resolves('processed');

            const result = await dlqProcessor['processMessage'](message);

            expect(eventProcessorStub.processEvent.calledWith({ id: 1 }, QUERY_STRING)).to.be.true;
            expect(result).to.equal('processed');
        });
    });

    describe('deleteMessage', () => {
        it('should delete a message from the DLQ', async () => {
            const dlqUrl = 'http://example.com/dlq';
            const receiptHandle = 'handle1';

            clientStub.send.resolves();

            await dlqProcessor['deleteMessage'](dlqUrl, receiptHandle);

            expect(clientStub.send.calledWith(sinon.match.instanceOf(DeleteMessageCommand))).to.be.true;
        });

        it('should throw an error if deleting a message fails', async () => {
            const dlqUrl = 'http://example.com/dlq';
            const receiptHandle = 'handle1';

            clientStub.send.rejects(new Error('Delete Error'));

            try {
                await dlqProcessor['deleteMessage'](dlqUrl, receiptHandle);
            } catch (error) {
                expect(error.message).to.equal('Delete Error');
            }
        });
    });
});