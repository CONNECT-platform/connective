import { should, expect } from 'chai'; should();

import { PinMap } from '../pin-map';
import { Pin } from '../pin';
import { Source } from '../source';


describe('PinMap', () => {
  describe('.get()', () => {
    it('should invoke the given factory function.', done => {
      new PinMap(() => { done(); return new Pin(); }).get('hellow');
    });

    it('should create a `Pin` if no factory function given.', () => {
      new PinMap().get('whatever').should.be.instanceof(Pin);
    });

    it('should return the same `PinLike` object for the same label.', () => {
      let pm = new PinMap();
      pm.get('a').should.equal(pm.get('a'));
    });
  });

  describe('.instantiated()', () => {
    it('should return true if a pin with given label is instantiated, false otherwise.', () => {
      let pm = new PinMap();
      pm.get('A');

      pm.instantiated('A').should.be.true;
      pm.instantiated('B').should.be.false;
    });
  });

  describe('.clear()', () => {
    it('should clear all instantiated pins.', () => {
      let a = new Source(); let pm = new PinMap();
      let called = false;

      a.to(pm.get('x'));
      let sub = pm.get('x').observable.subscribe(() => called = true);

      a.send();
      called.should.be.true;

      pm.clear(); sub.unsubscribe(); called = false;
      pm.get('x').observable.subscribe(() => called = true);

      a.send();
      called.should.be.false;
    });

    it('should also remove any reference to instantiated pins.', () => {
      let pm = new PinMap(); pm.get('dude');

      pm.instantiated('dude').should.be.true;
      pm.clear();
      pm.instantiated('dude').should.be.false;
    });
  });

  describe('.pins', () => {
    it('should return all instantiated pins.', () => {
      let a = new Pin(); let b = new Pin();
      let pm = new PinMap(label => (label=='a')?a:b);

      pm.get('a');

      pm.pins.should.include(a);
      pm.pins.should.not.include(b);
    });
  });
});
