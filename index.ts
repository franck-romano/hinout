import Hinout from './src/hinout';
import format from './src/infrastructure/formatter';
import EventHandler from './src/infrastructure/event-handler';

export default new Hinout({ logFn: console.log, formatFn: format, eventHandler: new EventHandler() });
