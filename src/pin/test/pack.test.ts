import { should } from 'chai'; should();

import { Source } from '../source';
import { PinMap } from '../pin-map';
import pack from '../pack';


describe('pack()', () => {
  it('should wait for all incoming pins and send their data.', done => {
    let a = new Source();
    let b = new Source();
    pack().from(a).from(b).observable.subscribe(data => {
      data.should.eql(['hellow', 'world']);
      done();
    });

    a.send('hellow');
    b.send('world');
  });

  it('should wait for all instantiated pins of a pin map and send their data in a key-value object', done => {
    let pm = new PinMap();
    let p = pack(pm);
    let a = new Source().to(pm.get('x'));
    let b = new Source().to(pm.get('y'));
    p.observable.subscribe(data => {
      data.x.should.equal(2);
      data.y.should.equal(3);
      done();
    });

    a.send(2);
    b.send(3);
  });

  it('should work properly if connected to a pinmap that already has some pins.', done => {
    let pm = new PinMap();
    let a = new Source().to(pm.get('x'));
    let b = new Source().to(pm.get('y'));
    let p = pack(pm);
    p.observable.subscribe(data => {
      data.x.should.equal(2);
      data.y.should.equal(3);
      done();
    });

    a.send(2);
    b.send(3);
  });

  it('should send data instantly if connected pinmap has no pins.', done => {
    pack(new PinMap()).observable.subscribe(() => done());
  });
});
