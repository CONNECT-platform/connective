import { State } from '../state';

import { testStateSpec } from './state.spec';


describe('State', () => {
  testStateSpec((...args: []) => new State(...args));
});
