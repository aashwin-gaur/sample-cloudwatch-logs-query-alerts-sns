import { expect } from 'chai';
import sinon, { SinonFakeTimers } from 'sinon';
import { CloudWatchLogsClient, StartQueryCommand, GetQueryResultsCommand, QueryStatus } from '@aws-sdk/client-cloudwatch-logs';
import LogRetreivalService from './LogRetreivalService'; // Replace 'your-file-name' with the actual file name
import { LogsQueryResult } from '../types';

describe('LogRetreivalService', () => {
    let clientStub: sinon.SinonStubbedInstance<CloudWatchLogsClient>;
    let clock: SinonFakeTimers;

    beforeEach(() => {
        clientStub = sinon.createStubInstance(CloudWatchLogsClient);
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        sinon.restore();
        clock.restore();
    });

    it('should retry querying until complete status is received', async () => {
        const logGroupName = 'test-log-group';
        const query = 'test-query';
        const startTime = new Date();
        const endTime = new Date();
        const queryId = 'test-query-id';

        // Stub StartQueryCommand to return queryId
        const startQueryStub = sinon.stub().returns({ queryId });
        clientStub.send.withArgs(sinon.match.instanceOf(StartQueryCommand)).callsFake(startQueryStub);

        // Stub GetQueryResultsCommand to simulate incomplete status twice and then complete status
        const incompleteResponse = { status: QueryStatus.Running };
        const completeResponse = { status: QueryStatus.Complete, results: [{ field: 'test', value: 'test' }] };
        const getQueryResultsStub = sinon.stub();
        getQueryResultsStub.onFirstCall().returns(incompleteResponse);
        getQueryResultsStub.onSecondCall().returns(incompleteResponse);
        getQueryResultsStub.onThirdCall().returns(completeResponse);
        clientStub.send.withArgs(sinon.match.instanceOf(GetQueryResultsCommand)).callsFake(getQueryResultsStub);

        // Create LogRetreivalService instance
        const logRetrievalService = new LogRetreivalService(clientStub as unknown as CloudWatchLogsClient);

        // Execute processEvent
        const queryResult: LogsQueryResult = await logRetrievalService.processEvent(logGroupName, query, startTime, endTime);

        // Asserts
        expect(queryResult).to.deep.equal({
            queryParams: { logGroupName, startTime: startTime.getTime(), endTime: endTime.getTime(), queryString: query },
            logEvents: [{ test: 'test' }]
        });
        sinon.assert.callCount(startQueryStub, 1);
        sinon.assert.callCount(getQueryResultsStub, 3);
        sinon.assert.calledWith(startQueryStub, sinon.match.instanceOf(StartQueryCommand));
        sinon.assert.calledWith(getQueryResultsStub, sinon.match.instanceOf(GetQueryResultsCommand));
    });

    it('should throw error if query status does not complete within retry limit', async () => {
        const logGroupName = 'test-log-group';
        const query = 'test-query';
        const startTime = new Date();
        const endTime = new Date();
        const queryId = 'test-query-id';

        // Stub StartQueryCommand to return queryId
        const startQueryStub = sinon.stub().returns({ queryId });
        clientStub.send.withArgs(sinon.match.instanceOf(StartQueryCommand)).callsFake(startQueryStub);

        // Stub GetQueryResultsCommand to simulate incomplete status
        const incompleteResponse = { status: QueryStatus.Running };
        const getQueryResultsStub = sinon.stub().returns(incompleteResponse);
        clientStub.send.withArgs(sinon.match.instanceOf(GetQueryResultsCommand)).callsFake(getQueryResultsStub);

        // Create LogRetreivalService instance
        const logRetrievalService = new LogRetreivalService(clientStub as unknown as CloudWatchLogsClient);

        // Execute processEvent
        let error: any;
        try {
            await logRetrievalService.processEvent(logGroupName, query, startTime, endTime);
        } catch (err) {
            error = err;
        }

        // Asserts
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Query status did not complete within retry limit.');
        sinon.assert.callCount(startQueryStub, 1);
        sinon.assert.callCount(getQueryResultsStub, 10); // Maximum retries = 10
        sinon.assert.calledWith(startQueryStub, sinon.match.instanceOf(StartQueryCommand));
        sinon.assert.calledWith(getQueryResultsStub, sinon.match.instanceOf(GetQueryResultsCommand));
    });
});
