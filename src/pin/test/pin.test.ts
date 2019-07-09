import { should, expect } from 'chai'; should();

import emission from '../../shared/emission';

import group from '../group';
import { Pin } from '../pin';
import { Source } from '../source';
import filter from '../filter';
import map from '../map';


describe('Pin', () => {
  describe('.from()', () => {
    it('should receive from data another pin.', done => {
      let s = new Source();
      s.to(new Pin()).subscribe(data => {
        data.should.equal('all work and no play ...');
        done();
      });
      s.send('all work and no play ...');
    });

    it('should receive data from multiple other pins.', () => {
      let a = new Source(); let b = new Source();
      let _ = 0;

      group(a, b).to(new Pin()).subscribe(n => {
        _ += n;
      });

      a.send(1); b.send(2); a.send(3);
      _.should.equal(6);
    });

    it('should receive data from a chain of pins.', () => {
      let a = new Source(); let b = new Source();
      let _: number[] = [];

      group(
        group(a, b).to(new Pin()),
        b.to(new Pin())
      ).to(new Pin()).subscribe(n => {
        _.push(n);
      });

      a.send(2); b.send(3); a.send(5);
      _.should.be.eql([2, 3, 3, 5]);
    });

    it('should work properly with a cycle of pins.', done => {
      let a = new Source();
      let b = new Pin();
      let c = new Pin();

      a.to(b)
        .to(filter((n: number) => n < 5))
        .to(map((n: number) => n + 1))
        .to(b)
        .to(filter((n: number) => n >= 5))
        .to(c);

      c.subscribe(n => {
        n.should.equal(5);
        done();
      });
      a.send(0);
    });

    it('should throw an error when is invoked after the pin\'s observable was accessed.', () => {
      let a = new Source(); let b = new Pin();
      b.observable;
      expect(() => {b.from(a)}).to.throw();
    });
  });

  describe('.to()', () => {
    it('should send data to another pin.', done => {
      let a = new Source(); let b = new Pin();
      a.to(new Pin()).to(b);
      b.observable.subscribe(() => done());
      a.send();
    });

    it('should send data to multiple other pins.', () => {
      let a = new Source(); let b = new Pin();
      let x = false;
      let y = false;

      a.to(b).to(new Pin()).subscribe(() => x = true);
      b.to(new Pin()).subscribe(() => y = true);

      x.should.be.false;
      y.should.be.false;

      a.send();

      x.should.be.true;
      y.should.be.true;
    });

    it('should pass down the same context object.', () => {
      let ctx = {};
      let x = false; let y = false;

      let a = new Source();
      let b = new Pin().from(a);
      b.to(new Pin()).observable.subscribe(e => x = e.context == ctx);
      b.to(new Pin()).observable.subscribe(e => y = e.context == ctx);

      a.emit(emission(undefined, ctx));
      x.should.be.true;
      y.should.be.true;
    });
  });

  describe('.clear()', () => {
    it('should clear the pin.', () => {
      let a = new Source(); let b = new Pin(); let called = false;
      a.to(b).subscribe(() => called = true);

      a.send();
      called.should.be.true;

      called = false;
      b.clear(); b.subscribe(() => called = true);

      a.send();
      called.should.be.false;
    });
  });

  describe('.locked', () => {
    it('should be false before `.observable` is accessed and true afterwards.', () => {
      let a = new Pin();
      a.locked.should.be.false;
      a.observable;
      a.locked.should.be.true;
    });

    it('should be false before `.subscribe()` is called and true afterwards.', () => {
      let a = new Pin();
      a.locked.should.be.false;
      a.subscribe(() => {});
      a.locked.should.be.true;
    });

    it('should lock all pins that are connected to this pin.', () => {
      let a = new Pin(); let b = new Pin(); let c = group(a, b).to(new Pin());
      a.locked.should.be.false; b.locked.should.be.false;

      c.observable;
      a.locked.should.be.true; b.locked.should.be.true;
    });
  });
});
