import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import EventProcessor from './EventProcessor';
import LogRetreivalService from '../services/LogRetreivalService';
import EmailService from '../services/EmailService';
import { config } from '../config';
import { LogEvent } from '../types';

describe('EventProcessor', () => {
    let cloudwatchLogsClient: any;
    let snsClient: any;
    let cwLogsInsights: LogRetreivalService;
    let snsMailer: EmailService;
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
            const logEvents: LogEvent[] = [
                {
                    timestamp: '2024-05-09 04:47:54.584',
                    log: 'acc-id:aws-cloudtrail-logs-acc-id-1fb3cd27',
                    logStream: 'acc-id_CloudTrail_ap-southeast-2_3',
                    eventSource: 's3.amazonaws.com',
                    eventTime: '2024-05-09T04:45:48Z',
                    eventType: 'AwsApiCall',
                    userArn: 'arn:aws:iam::acc-id:root',
                    userPrincipalId: 'acc-id',
                    bucketName: 'sample-bucket',
                    resourceArn: 'arn:aws:s3:::sample-bucket',
                    resourceAccountId: 'acc-id',
                    sourceIPAddress: '100.100.100.100',
                    managementEvent: '1',
                    readOnly: '1',
                  },
                  {
                    timestamp: '2024-05-09 04:47:54.584',
                    log: 'acc-id:aws-cloudtrail-logs-acc-id-1fb3cd27',
                    logStream: 'acc-id_CloudTrail_ap-southeast-2_3',
                    eventSource: 's3.amazonaws.com',
                    eventTime: '2024-05-09T04:45:48Z',
                    eventType: 'AwsApiCall',
                    userArn: 'arn:aws:iam::acc-id:root',
                    userPrincipalId: 'acc-id',
                    bucketName: 'sample-bucket',
                    resourceArn: 'arn:aws:s3:::sample-bucket',
                    resourceAccountId: 'acc-id',
                    sourceIPAddress: '100.100.100.100',
                    managementEvent: '1',
                    readOnly: '1',
                  },
            ];
            // Stub processEvent method of CloudWatchLogsInsights class
            const processEventStub = sinon.stub(cwLogsInsights, 'processEvent').resolves(logEvents);

            // Stub sendEmail method of SNSMailer class
            const sendEmailStub = sinon.stub(snsMailer, 'sendEmail').resolves();

            const result = await eventProcessor.processEvent(event, queryString);

            // Assertions
            expect(result).to.equal('Email sent successfully');
            expect(processEventStub.calledOnceWithExactly(config.LOG_GROUP_NAME, queryString, new Date(event.time))).to.be.true;
            expect(sendEmailStub.calledOnceWithExactly(logEvents, config.SNS_TOPIC_ARN)).to.be.true;
        });
    });
});
