interface EnvConfig {
    LOG_GROUP_NAME: string,
    DLQ_URL: string,
    SNS_TOPIC_ARN: string

    DURATION_TO_QUERY_MINS: number,
    DLQ_MAX_MESSAGES_TO_PROCESS: number
    DLQ_WAIT_TIME_SECONDS: number
}

export interface Event {
    time: string
}

export const config: EnvConfig = {
    LOG_GROUP_NAME: process.env.LOG_GROUP_NAME!,
    DLQ_URL: process.env.DLQ_URL!,
    SNS_TOPIC_ARN: process.env.SNS_TOPIC_ARN!,

    DURATION_TO_QUERY_MINS: 12,
    DLQ_MAX_MESSAGES_TO_PROCESS: 10,
    DLQ_WAIT_TIME_SECONDS: 2
};
