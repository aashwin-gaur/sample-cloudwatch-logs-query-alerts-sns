import { LogEvent } from "../types";
import { PublishBatchCommandInput } from "@aws-sdk/client-sns";


export default function generateS3AlertEmail(accountId: string,logs: LogEvent[], start: string, end: string){
    return {
        Subject: `Sec alerts from ${start} to ${end}`,
        Message: `Hi Team, 
        See logs below:
        ${logs}
        `
    }
}