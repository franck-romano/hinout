import Hinout from './src/hinout';
import EventHandler from './src/infrastructure/event-handler';

export = new Hinout({ logFn: console.log, eventHandler: new EventHandler() });
