import { should } from 'chai'; should();

import { isBindable } from '../bindable';


describe('bindable', () => {
  describe('.isBindable()', () => {
    it('should return if something satisfies bindable interface.', () => {
      class X { bind(): this { return this; } }
      class Y {}
      let Z = { bind: () => {} };
      let W = 42;

      isBindable(new X()).should.be.true;
      isBindable(new Y()).should.be.false;
      isBindable(Z).should.be.true;
      isBindable(W).should.be.false;
    });
  });
});
