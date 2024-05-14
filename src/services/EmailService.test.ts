import { expect } from 'chai';
import sinon from 'sinon';
import EmailService from './EmailService';
import { SNSClient, PublishCommand, PublishBatchCommandInput, PublishCommandInput } from '@aws-sdk/client-sns';
import { LogEvent, LogsQueryResult } from '../types';
import { StartQueryCommandInput } from '@aws-sdk/client-cloudwatch-logs';

describe('EmailService', () => {
    describe('sendEmail', () => {
        it('should send emails in batches', async () => {
            // Mock dependencies
            const snsClient = new SNSClient({});
            const emailService = new EmailService(snsClient);

            // Stub the SNSClient send method
            const sendStub = sinon.stub(snsClient, 'send');

            // Prepare test data
            const logEvents = Array.from({ length: 250 }, (_, i) => ({ timestamp: `2024-05-08T12:00:0${i}Z`, eventType: `Log event ${i}` } as Partial<LogEvent> as LogEvent));
            const queryResult: LogsQueryResult = { queryParams: {} as Partial<StartQueryCommandInput> as StartQueryCommandInput, logEvents: logEvents };

            // Call sendEmail method
            await emailService.sendEmail(queryResult);

            // Assertions
            expect(sendStub.callCount).to.equal(3); // 250 log events in batches of 100 => 3 batches
            expect(sendStub.getCall(0).args[0]).to.be.instanceOf(PublishCommand);
            expect(sendStub.getCall(1).args[0]).to.be.instanceOf(PublishCommand);
            expect(sendStub.getCall(2).args[0]).to.be.instanceOf(PublishCommand);

            // Restore the stub
            sendStub.restore();
        });
    });
});