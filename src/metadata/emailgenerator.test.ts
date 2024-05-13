import { expect } from 'chai';
import generateS3AlertEmail from './emailgenerator';
import { LogEvent } from '../types';

describe('generateS3AlertEmail', () => {
    it('should generate the correct email subject and message', () => {
        const accountId = '123456789012';
        const logs: LogEvent[] = [
            { timestamp: '2024-05-08T12:00:00Z', eventType: 'Event 1' } as Partial<LogEvent> as LogEvent,
            { timestamp: '2024-05-08T12:10:00Z', eventType: 'Event 2' } as Partial<LogEvent> as LogEvent,
            { timestamp: '2024-05-08T12:20:00Z', eventType: 'Event 3' } as Partial<LogEvent> as LogEvent,
        ];
        const start = '2024-05-08T12:00:00Z';
        const end = '2024-05-08T12:30:00Z';

        const expectedSubject = `Sec alerts from ${start} to ${end}`;
        const expectedMessage = `Hi Team, 
        See logs below:
        ${logs.map(log => `${log.timestamp}: ${log.eventType}`).join('\n')}
        `;

        const email = generateS3AlertEmail(accountId, logs, start, end);

        expect(email).to.have.property('Subject', expectedSubject);
        expect(email).to.have.property('Message', expectedMessage);
    });

    it('should handle empty log events', () => {
        const accountId = '123456789012';
        const logs: LogEvent[] = [];
        const start = '2024-05-08T12:00:00Z';
        const end = '2024-05-08T12:30:00Z';

        const expectedSubject = `Sec alerts from ${start} to ${end}`;
        const expectedMessage = `Hi Team, 
        See logs below:
        
        `;

        const email = generateS3AlertEmail(accountId, logs, start, end);

        expect(email).to.have.property('Subject', expectedSubject);
        expect(email).to.have.property('Message', expectedMessage);
    });
});