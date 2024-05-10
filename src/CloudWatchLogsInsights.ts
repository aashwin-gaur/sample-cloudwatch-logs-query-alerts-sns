import { CloudWatchLogsClient, StartQueryCommand, GetQueryResultsCommand, QueryStatus } from '@aws-sdk/client-cloudwatch-logs';

class CloudWatchLogsInsights {
    private TIME = (2 * 24 * 5) * 12 * 60 * 1000;  // 48 hours before endTime
    private DELAY_FOR_RETRY_QUERY_RESULTS = 2 * 1000;
    private client: CloudWatchLogsClient;

    constructor(client: CloudWatchLogsClient) {
        this.client = client;
    }

    async processEvent(logGroupName: string, query: string): Promise<any[]> {
        const endTime = new Date(); // Assuming the current time
        const startTime = new Date(endTime.getTime() - this.TIME);
        
        const startQueryParams = {
            logGroupName: logGroupName,
            startTime: startTime.getTime(),
            endTime: endTime.getTime(),
            queryString: query,
        };

        try {
            console.log("Starting Query - ")
            console.log(`Log Group - ${logGroupName}`)
            console.log(query);

            const startQueryCommand = new StartQueryCommand(startQueryParams);
            const response = await this.client.send(startQueryCommand);
            const queryId = response.queryId;
            
            if (queryId) {
                const queryResults = await this.getQueryResults(queryId);
                return queryResults;

            } else {
                throw new Error("Query ID is undefined.");
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
            const response = await this.client.send(getQueryResultsCommand);
            if(response.status === QueryStatus.Complete) {
                const results = response.results || [];
                console.log(`Found ${results.length} logs.`);
                return results.map(
                    row => row.reduce((acc, { field, value }) => 
                        ({ ...acc, [field as string]: value }), 
                    {}));
            } else {
                await new Promise(resolve => setTimeout(resolve, this.DELAY_FOR_RETRY_QUERY_RESULTS)); // Delay for 2 seconds
                return this.getQueryResults(queryId);
            }
            
        } catch (err) {
            console.error("Error getting query results from CloudWatch Logs Insights:", err);
            throw err;
        }
    }
}

export default CloudWatchLogsInsights;
