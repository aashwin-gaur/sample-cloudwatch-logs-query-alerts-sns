
const FILTER_PATTERN = 'eventSource = "s3.amazonaws.com" and (userIdentity.type != "AWSService" and userIdentity.invokedBy != "cloudtrail.amazonaws.com")';
const QUERY_STRING = `fields @timestamp, @log, @logStream, eventSource, eventTime,eventType, userIdentity.arn,userIdentity.principalId, requestParameters.bucketName,resources.0.ARN,resources.0.accountId,sourceIPAddress,managementEvent,readOnly
                | filter ${FILTER_PATTERN}
                | sort @timestamp desc
                `;

export default QUERY_STRING;