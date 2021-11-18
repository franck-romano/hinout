import Hinout from './src/Hinout';
import { EventHandler } from './src/infrastructure/EventHandler';

export = new Hinout({ logFn: console.log, eventHandler: new EventHandler() });
