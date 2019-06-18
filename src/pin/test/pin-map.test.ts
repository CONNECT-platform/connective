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

  describe('.subscribe()', () => {
    it('should invoke the callback with proper parameters for every pin that is created', done => {
      let p = new Pin();
      let pm = new PinMap(() => p);
      pm.subscribe((label, pin) => {
        label.should.equal('AA');
        pin.should.equal(p);
        done();
      });

      pm.get('AA');
    });

    it('should only invoke the callback on creation.', () => {
      let _c = 0;
      let pm = new PinMap();
      pm.subscribe(() => _c++);

      pm.get('X'); pm.get('X');
      _c.should.equal(1);
    });

    it('should feed any subscriber all already created pins.', () => {
      let a = <string[]>[]; let b = <string[]>[]; let c = <string[]>[];

      let pm = new PinMap();
      pm.get('a');
      pm.subscribe(label => a.push(label));
      pm.get('b');
      pm.subscribe(label => b.push(label));
      pm.get('c');
      pm.subscribe(label => c.push(label));

      a.should.eql(['a', 'b', 'c']);
      b.should.eql(['a', 'b', 'c']);
      c.should.eql(['a', 'b', 'c']);
    });

    it('should return a subscription that can be unsubscribed', () => {
      let _c = 0;

      let pm = new PinMap();
      let sub = pm.subscribe(() => _c++);

      pm.get('a'); pm.get('b');
      sub.unsubscribe();
      pm.get('c');

      _c.should.equal(2);
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
