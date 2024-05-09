import { expect } from 'chai';
import sinon from 'sinon';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import SNSMailer from './SNSMailer';

export default async function SNSMailerTest() {
    describe('SNSMailer', () => {
        describe('sendEmail', () => {
            it('should send email batches', async () => {
                const mockClient = {
                    send: sinon.stub().resolves({})
                };

                sinon.stub(SNSClient.prototype, 'send').callsFake((command) => {
                    if (command instanceof PublishCommand) {
                        return {};
                    } else {
                        throw new Error('Unexpected command');
                    }
                });

                const snsMailer = new SNSMailer(mockClient as any);
                const logEvents = Array.from({ length: 900 }, (_, i) => ({ eventTime: new Date(), message: `Message ${i}` }));

                await snsMailer.sendEmail(logEvents as any[], 'test-sns-topic');

                expect(mockClient.send.callCount).to.equal(3); // Three email batches for 900 messages
            });
        });
    });
}

if (require.main === module) {
    (async () => {
        await SNSMailerTest();
    })();
}
