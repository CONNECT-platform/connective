import { should, expect } from 'chai'; should();

import emission from '../../shared/emission';

import { Source } from '../source';
import { PinMap } from '../pin-map';
import pack from '../pack';


describe('pack()', () => {
  it('should wait for all incoming pins and send their data.', done => {
    let a = new Source();
    let b = new Source();
    pack().from(a, b).subscribe(data => {
      data.should.eql(['hellow', 'world']);
      done();
    });

    a.send('hellow');
    b.send('world');
  });

  it('should receive the incoming pins in constructor as well.', done => {
    let a = new Source();
    let b = new Source();
    pack(a,b).subscribe(data => {
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
    p.subscribe(data => {
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
    p.subscribe(data => {
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

  it('should also handle a combination of pins and pinmaps.', done => {
    let pm = new PinMap(); let pm2 = new PinMap();
    let a = new Source();
    let b = new Source().to(pm.get('x'));
    let c = new Source().to(pm.get('y'));
    let d = new Source();
    let e = new Source().to(pm2.get('I'));

    pack(a, pm, d, pm2).subscribe(data => {
      data[0].should.equal(42);
      data[1].x.should.equal('world');
      expect(data[1].y).to.be.undefined;
      data[2].should.be.false;
      expect(data[3].I).to.be.undefined;
      done();
    });

    a.send(42); b.send('world'); c.send(); d.send(false); e.send(undefined);
  });

  it('should merge context of incoming emissions.', done => {
    let a = new Source();
    let b = new Source();
    let pm = new PinMap();
    let c = new Source().to(pm.get('x'));
    let d = new Source().to(pm.get('y'));

    pack(a, b, pm).observable.subscribe(emission => {
      emission.context.x.should.equal(2);
      emission.context.y.should.equal(3);
      emission.context.w.should.equal(4);
      emission.context.z.should.equal(5);
      done();
    });

    a.emit(emission(undefined, { x : 2 }));
    b.emit(emission(undefined, { y : 3 }));
    c.emit(emission(undefined, { w : 4 }));
    d.emit(emission(undefined, { z : 5 }));
  });
});
