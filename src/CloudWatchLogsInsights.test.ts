import { expect } from 'chai';
import sinon from 'sinon';
import { CloudWatchLogsClient, StartQueryCommand, GetQueryResultsCommand } from '@aws-sdk/client-cloudwatch-logs';
import CloudWatchLogsInsights from './CloudWatchLogsInsights';

export default async function CloudWatchLogsInsightsTest() {
    describe('CloudWatchLogsInsights', () => {
        describe('processEvent', () => {
            it('should return query results', async () => {
                const mockClient = {
                    send: sinon.stub().resolves({ queryId: 'testQueryId' })
                };

                sinon.stub(CloudWatchLogsClient.prototype, 'send').callsFake((command) => {
                    if (command instanceof StartQueryCommand) {
                        return { queryId: 'testQueryId' };
                    } else if (command instanceof GetQueryResultsCommand) {
                        return { results: [[{ value: '2024-05-09T10:00:00Z' }, { value: 'Test message' }]] };
                    } else {
                        throw new Error('Unexpected command');
                    }
                });

                const cwLogs = new CloudWatchLogsInsights(mockClient as any);
                const logEvents = await cwLogs.processEvent('test-log-group', 'test-query', new Date('2024-05-09T10:00:00Z'));

                expect(logEvents).to.deep.equal([{ eventTime: new Date('2024-05-09T10:00:00Z'), message: 'Test message' }]);
            });
        });
    });
}

if (require.main === module) {
    (async () => {
        await CloudWatchLogsInsightsTest();
    })();
}
