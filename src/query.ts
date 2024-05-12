
const S3_FILTER_PATTERN = 'eventSource = "s3.amazonaws.com" and (userIdentity.type != "AWSService" and userIdentity.invokedBy != "cloudtrail.amazonaws.com")';
const QUERY_STRING = `fields @timestamp as timestamp, @log as log, @logStream as logStream, eventSource, eventTime,eventType, userIdentity.arn as userArn,userIdentity.principalId as userPrincipalId, requestParameters.bucketName as bucketName,resources.0.ARN as resourceArn,resources.0.accountId as resourceAccountId,sourceIPAddress,managementEvent,readOnly
                | filter ${S3_FILTER_PATTERN}
                | sort @timestamp desc
                `;

export default QUERY_STRING;