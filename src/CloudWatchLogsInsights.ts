import { CloudWatchLogsClient, StartQueryCommand, GetQueryResultsCommand } from '@aws-sdk/client-cloudwatch-logs';

class CloudWatchLogsInsights {
    private client: CloudWatchLogsClient;

    constructor(client: CloudWatchLogsClient) {
        this.client = client;
    }

    async processEvent(logGroupName: string, query: string): Promise<any[]> {
        const endTime = new Date(); // Assuming the current time
        const startTime = new Date(endTime.getTime() - 10 * 60 * 1000); // 10 minutes before endTime

        const startQueryParams = {
            logGroupName: logGroupName,
            startTime: startTime.getTime(),
            endTime: endTime.getTime(),
            queryString: query,
        };

        try {
            const startQueryCommand = new StartQueryCommand(startQueryParams);
            const response = await this.client.send(startQueryCommand);
            const queryId = response.queryId;

            if (queryId) {
                const queryResults = await this.getQueryResults(queryId);
                return queryResults;
            } else {
                throw new Error("Query ID is undefined");
            }
        } catch (err) {
            console.error("Error querying CloudWatch Logs Insights:", err);
            throw err;
        }
    }

    private async getQueryResults(queryId: string): Promise<any[]> {
        const params = {
            queryId: queryId
        };

        try {
            const getQueryResultsCommand = new GetQueryResultsCommand(params);
            const data = await this.client.send(getQueryResultsCommand);
            const results = data.results || [];

            const formattedResults = results.map((result: any) => {
                const logEvent = {
                    eventTime: new Date(result[0].value),
                    message: result[1].value
                };
                return logEvent;
            });

            return formattedResults;
        } catch (err) {
            console.error("Error getting query results from CloudWatch Logs Insights:", err);
            throw err;
        }
    }
}

export default CloudWatchLogsInsights;
