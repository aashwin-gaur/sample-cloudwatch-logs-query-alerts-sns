import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import EventProcessor from './EventProcessor';
import CloudWatchLogsInsights from '../CloudWatchLogsInsights';
import SNSMailer from '../SNSMailer';
import { config } from '../config';

describe('EventProcessor', () => {
    let cloudwatchLogsClient: any;
    let snsClient: any;
    let cwLogsInsights: CloudWatchLogsInsights;
    let snsMailer: SNSMailer;
    let eventProcessor: EventProcessor;

    beforeEach(() => {
        cloudwatchLogsClient = {};
        snsClient = {};
        eventProcessor = new EventProcessor(cloudwatchLogsClient, snsClient);
    });

    describe('processEvent', () => {
        it('should process the event and send an email', async () => {
            const event = { time: '2024-05-10T12:00:00Z' };
            const queryString = 'your_query_string';
            const logEvents = [{ key1: 'value1' }, { key2: 'value2' }];

            // Stub processEvent method of CloudWatchLogsInsights class
            const processEventStub = sinon.stub(cwLogsInsights, 'processEvent').resolves(logEvents);

            // Stub sendEmail method of SNSMailer class
            const sendEmailStub = sinon.stub(snsMailer, 'sendEmail').resolves('Email sent successfully');

            const result = await eventProcessor.processEvent(event, queryString);

            // Assertions
            expect(result).to.equal('Email sent successfully');
            expect(processEventStub.calledOnceWithExactly(config.LOG_GROUP_NAME, queryString, new Date(event.time))).to.be.true;
            expect(sendEmailStub.calledOnceWithExactly(logEvents, config.SNS_TOPIC_ARN)).to.be.true;
        });
    });
});
