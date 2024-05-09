import { expect } from 'chai';
import sinon from 'sinon';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import DLQProcessor from './DLQProcessor';

export default async function DLQProcessorTest() {
    describe('DLQProcessor', () => {
        describe('processMessages', () => {
            it('should process DLQ messages', async () => {
                const mockClient = {
                    send: sinon.stub().resolves({ Messages: [{ Body: '{"eventId": "testEventId"}', ReceiptHandle: 'testReceiptHandle' }] })
                };

                sinon.stub(SQSClient.prototype, 'send').callsFake((command) => {
                    if (command instanceof ReceiveMessageCommand) {
                        return { Messages: [{ Body: '{"eventId": "testEventId"}', ReceiptHandle: 'testReceiptHandle' }] };
                    } else if (command instanceof DeleteMessageCommand) {
                        return {};
                    } else {
                        throw new Error('Unexpected command');
                    }
                });

                const dlqProcessor = new DLQProcessor(mockClient as any);
                await dlqProcessor.processMessages('test-dlq-url');

                expect(mockClient.send.callCount).to.equal(2); // Two commands: ReceiveMessageCommand and DeleteMessageCommand
            });
        });
    });
}

if (require.main === module) {
    (async () => {
        await DLQProcessorTest();
    })();
}
