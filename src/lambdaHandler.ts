
import createECSLogger from './logger'
import { Event } from './config';
import { dependencies } from './processors';

export async function lambdaHandler(event: Event, context: any) {
    const log = createECSLogger();
    
    await dependencies.eventProcessor.processEvent(event);
    await dependencies.dlqProcessor.processMessages();

    log.debug("test")

}
