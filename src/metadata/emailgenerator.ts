import { LogEvent } from "../types";
import { PublishBatchCommandInput } from "@aws-sdk/client-sns";

function formatTimestamps(date1: Date, date2: Date): string {
    const dateString1 = `${date1.toDateString()} ${date1.toTimeString().slice(0, 8)}`;
    
    let dateString2 = "";
    if (date2.getDate() !== date1.getDate() || date2.getMonth() !== date1.getMonth() || date2.getFullYear() !== date1.getFullYear()) {
        dateString2 = `${date2.toDateString()} `;
    }
    dateString2 += date2.toTimeString().slice(0, 8);

    return `Between ${dateString1} - ${dateString2} GMT+1000 (AEST)`;
}

// Example usage
const date1 = new Date('2024-05-08T22:00:00Z');
const date2 = new Date('2024-05-09T22:10:00Z');
const formattedString = formatTimestamps(date1, date2);
console.log(formattedString); // Output: Between Wed May 08 2024 22:00:00 - Thu May 09 2024 22:10:00 GMT+1000 (AEST)

export default function generateS3AlertEmail(accountId: string,logs: LogEvent[], start: string, end: string){
    return {
        Subject: `Sec alerts from ${start} to ${end}`,
        Message: `Hi Team, 
        See logs below:
        ${logs}
        `
    }
}