export interface RawLogEvent {
    '@timestamp': string;
    '@log': string;
    '@logStream': string;
    eventSource: string;
    eventTime: string;
    eventType: string;
    'userIdentity.arn': string;
    'userIdentity.principalId': string;
    'resources.0.ARN': string;
    'resources.0.accountId': string;
    sourceIPAddress: string;
    managementEvent: string;
    readOnly: string;
    '@ptr': string;

    'requestParameters.bucketName'?: string;
}

export const DISCARD_FIELDS : Set<string> = new Set([
    "@ptr"
]);

export const KEY_MAPPINGS = {
    "@timestamp" : "timestamp",
    "@log": "log",
    "@logStream": "logStream",
    "userIdentity.arn": "userArn",
    "userIdentity.principalId": "userPrincipalId",
    "resources.0.ARN": "resourceArn",
    "resources.0.accountId": "resourceAccountId",

    'requestParameters.bucketName': "bucketName"
}

export interface MappedLogEvent {
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