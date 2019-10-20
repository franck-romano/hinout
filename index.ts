import Hinout from './src/hinout';
import format from './src/infrastructure/formatter';

export default new Hinout({ logFn: console.log, formatFn: format });
