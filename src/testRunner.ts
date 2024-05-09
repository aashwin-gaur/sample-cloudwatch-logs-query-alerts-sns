import 'mocha';
import CloudWatchLogsInsightsTest from './CloudWatchLogsInsights test';
import DLQProcessorTest from './DLQProcessor.test';
import SNSMailerTest from './SNSMailer.test';

describe('Test Suite', () => {
    it('Runs all tests', async () => {
        await CloudWatchLogsInsightsTest();
        await DLQProcessorTest();
        await SNSMailerTest();
    });
});
