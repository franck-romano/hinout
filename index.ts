import Hinout from './src/Hinout';
import { EventHandler } from './src/infrastructure/EventHandler';

const hinout = new Hinout({ logFn: console.log, eventHandler: new EventHandler() });

export default hinout;
