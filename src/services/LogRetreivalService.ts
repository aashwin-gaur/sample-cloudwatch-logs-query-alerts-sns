import { CloudWatchLogsClient, StartQueryCommand, GetQueryResultsCommand, QueryStatus, StartQueryCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { DISCARD_FIELDS, LogEvent, LogsQueryResult } from '../types';

class LogRetreivalService {
    private DELAY_FOR_RETRY_QUERY_RESULTS_MILLIS = 2 * 1000;
    private client: CloudWatchLogsClient;

    constructor(client: CloudWatchLogsClient) {
        this.client = client;
    }

    async processEvent(logGroupName: string, query: string, startTime: Date, endTime: Date): Promise<LogsQueryResult> {

        const startQueryParams: StartQueryCommandInput = {
            logGroupName: logGroupName,
            startTime: startTime.getTime(),
            endTime: endTime.getTime(),
            queryString: query,
        };

        try {
            console.log("Starting Query");
            console.log(startQueryParams);
            const startQueryCommand = new StartQueryCommand(startQueryParams);
            const response = await this.client.send(startQueryCommand);
            const queryId = response.queryId;

            if (queryId) {
                const queryResults = await this.getQueryResults(queryId);
                return { queryParams: startQueryParams, logEvents: queryResults };

            } else {
                throw new Error("Query ID is undefined.");
            }
        } catch (err) {
            console.error("Error querying CloudWatch Logs Insights:", err);
            throw err;
        }
    }

    private async getQueryResults(queryId: string): Promise<LogEvent[]> {
        const params = {
            queryId: queryId
        };

        try {
            const getQueryResultsCommand = new GetQueryResultsCommand(params);
            const response = await this.client.send(getQueryResultsCommand);
            if (response.status === QueryStatus.Complete) {
                const results = response.results || [];
                console.log(`Found ${results.length} logs.`);
                return results.map(
                    row => row
                        .filter(k => DISCARD_FIELDS.has(k.field as string))
                        .reduce((acc, { field, value }) =>
                            ({ ...acc, [field as string]: value }),
                            {}) as LogEvent);
            } else {
                await new Promise(resolve => setTimeout(resolve, this.DELAY_FOR_RETRY_QUERY_RESULTS_MILLIS)); // Delay for 2 seconds
                return this.getQueryResults(queryId);
            }

        } catch (err) {
            console.error("Error getting query results from CloudWatch Logs Insights:", err);
            throw err;
        }
    }
}

export default LogRetreivalService;
