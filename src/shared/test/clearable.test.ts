import { should } from 'chai'; should();

import { isClearable } from '../clearable';


describe('clearable', () => {
  describe('.isClearable()', () => {
    it('should return if something satisfies clearable interface.', () => {
      class X { clear(): this { return this; } }
      class Y {}
      let Z = { clear: () => {} };
      let W = 42;

      isClearable(new X()).should.be.true;
      isClearable(new Y()).should.be.false;
      isClearable(Z).should.be.true;
      isClearable(W).should.be.false;
    });
  });
});
