import logger from './infrastructure/logger';
import OutboundTracer from './outbound-tracer';

export default new OutboundTracer(logger);
