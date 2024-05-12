export const DISCARD_FIELDS : Set<string> = new Set([
    "@ptr"
]);

export interface LogEvent {
    timestamp: string;
    log: string;
    logStream: string;
    eventSource: string;
    eventTime: string;
    eventType: string;
    userArn: string;
    userPrincipalId: string;
    resourceArn: string;
    resourceAccountId: string;
    sourceIPAddress: string;
    managementEvent: string;
    readOnly: string;
    
    bucketName?: string
}