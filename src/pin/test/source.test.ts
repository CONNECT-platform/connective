import { should, expect } from 'chai'; should();

import { Source } from '../source';
import { Pin } from '../pin';


describe('Source', () => {
  describe('.send()', () => {
    it('should send data retrievable via `.observable`.', done => {
      let s = new Source();
      s.observable.subscribe(data => {
        data.should.equal(42);
        done();
      });
      s.send(42);
    });
  });

  describe('.from()', () => {
    it('should receive data from another pin.', done => {
      let a = new Source(); let b = new Source();
      b.from(a).observable.subscribe(data => {
        data.should.equal('Howdy!!');
        done();
      });
      a.send('Howdy!!');
    });

    it('should be able to receive from multiple sources.', () => {
      let _ = 0;
      let a = new Source(); let b = new Source();
      let c = new Source().from(a).from(b);

      c.observable.subscribe(n => _ += n);
      a.send(1); b.send(2); a.send(3);
      _.should.equal(6);
    });

    it('should not lock pins.', () => {
      let a = new Pin();
      new Source().from(a);
      a.locked.should.be.false;
    });
  });

  describe('.to()', () => {
    it('should channel data to another pin.', done => {
      let a = new Source(); let b = new Source().to(a);
      a.observable.subscribe(() => done());
      b.send();
    });
  });

  describe('.clear()', () => {
    it('should clear the incoming connections.', () => {
      let a = new Source(); let b = new Source().from(a);
      b.observable.subscribe(() => { throw Error('this should not happen.'); });
      expect(() => { a.send() }).to.throw;
      b.clear();
      expect(() => { a.send() }).not.to.throw;
    });
  });
});
