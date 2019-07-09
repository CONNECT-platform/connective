import { should, expect } from 'chai'; should();

import group from '../group';
import { Source } from '../source';
import { Pin } from '../pin';


describe('Source', () => {
  describe('.send()', () => {
    it('should send data retrievable via `.subscribe()`.', done => {
      let s = new Source();
      s.subscribe(data => {
        data.should.equal(42);
        done();
      });
      s.send(42);
    });

    it('should be able to send context as well, retrievable via `.observable`', done => {
      let s = new Source();
      s.observable.subscribe(emission => {
        expect(emission.context).not.to.be.undefined;
        emission.context.x.should.equal(42);
        done();
      });
      s.send(undefined, {x: 42});
    });
  });

  describe('.from()', () => {
    it('should receive data from another pin.', done => {
      let a = new Source(); let b = new Source();
      a.to(b).subscribe(data => {
        data.should.equal('Howdy!!');
        done();
      });
      a.send('Howdy!!');
    });

    it('should be able to receive from multiple sources.', () => {
      let _ = 0;
      let a = new Source(); let b = new Source();
      group(a, b).to(new Source()).subscribe(n => _ += n);

      a.send(1); b.send(2); a.send(3);
      _.should.equal(6);
    });

    it('should also receive context.', done => {
      let a = new Source();

      a.to(new Source()).observable.subscribe(emission => {
        emission.context.x.should.equal(42);
        done();
      });

      a.send('whatever', {x : 42});
    });

    it('should not lock pins.', () => {
      let a = new Pin();
      new Source().from(a);
      a.locked.should.be.false;
    });
  });

  describe('.to()', () => {
    it('should channel data to another pin.', done => {
      let a = new Source();
      a.to(new Source()).subscribe(() => done());
      a.send();
    });
  });

  describe('.clear()', () => {
    it('should clear the incoming connections.', () => {
      let a = new Source(); let b = new Source();
      let called = false;
      a.to(b).subscribe(() => called = true);

      a.send();
      called.should.be.true;

      b.clear(); called = false;

      a.send();
      called.should.be.false;
    });

    it('should clear outgoing connections as well.', () => {
      let a = new Source(); let b = new Source(); let called = false;
      a.to(b).subscribe(() => called = true);

      a.send();
      called.should.be.true;

      a.clear(); called = false;

      a.send();
      called.should.be.false;
    });

    it('should be usable after being cleared.', () => {
      let a = new Source(); let b = new Source();
      let called = false; a.to(b);

      a.clear().to(b);
      b.subscribe(() => called = true);
      a.send();
      called.should.be.true;
    });
  });
});
