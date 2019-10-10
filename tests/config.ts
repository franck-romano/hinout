import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import dirtyChai from 'dirty-chai';
import chai, { expect as chaiExpect } from 'chai';

chai.should();
chai.use(sinonChai);
chai.use(dirtyChai);
const expect: any = chaiExpect;

export { sinon, expect };
