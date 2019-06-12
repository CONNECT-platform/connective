import { should, expect } from 'chai'; should();

import { Pin } from '../pin';
import { Source } from '../source';


describe('Pin', () => {
  describe('.from()', () => {
    it('should receive from data another pin.', done => {
      let s = new Source();
      new Pin().from(s).observable.subscribe(data => {
        data.should.equal('all work and no play ...');
        done();
      });
      s.send('all work and no play ...');
    });

    it('should receive data from multiple other pins.', () => {
      let a = new Source(); let b = new Source();
      let _ = 0;

      new Pin().from(a).from(b).observable.subscribe(n => {
        _ += n;
      });

      a.send(1); b.send(2); a.send(3);
      _.should.equal(6);
    });

    it('should receive data from a chain of pins.', () => {
      let a = new Source(); let b = new Source();
      let _: number[] = [];

      new Pin().from(new Pin().from(a).from(b)).from(new Pin().from(b)).observable.subscribe(n => {
        _.push(n);
      });

      a.send(2); b.send(3); a.send(5);
      _.should.be.eql([2, 3, 3, 5]);
    });

    it('should throw an error when is invoked after the pin\'s observable was accessed.', () => {
      let a = new Source(); let b = new Pin();
      b.observable;
      expect(() => {b.from(a)}).to.throw;
    });
  });

  describe('.to()', () => {
    it('should send data to another pin.', done => {
      let a = new Source(); let b = new Pin();
      new Pin().from(a).to(b);
      b.observable.subscribe(() => done());
      a.send();
    });
  });

  describe('.clear()', () => {
    it('should clear the pin.', () => {
      let a = new Source(); let b = new Pin().from(a);
      b.observable.subscribe(() => { throw new Error('should not have happened.')});
      expect(() => a.send()).to.throw;
      b.clear();
      expect(() => a.send()).not.to.throw;
    });
  });

  describe('.locked', () => {
    it('should be false before `.observable` is accessed and true afterwards.', () => {
      let a = new Pin();
      a.locked.should.be.false;
      a.observable;
      a.locked.should.be.true;
    });

    it('should lock all pins that are connected to this pin.', () => {
      let a = new Pin(); let b = new Pin(); let c = new Pin().from(a).from(b);
      a.locked.should.be.false; b.locked.should.be.false;

      c.observable;
      a.locked.should.be.true; b.locked.should.be.true;
    });
  });
});
