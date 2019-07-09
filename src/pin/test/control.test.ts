import { should } from 'chai'; should();

import emission from '../../shared/emission';

import group from '../group';
import { Source } from '../source';
import { Control } from '../control';
import { Pin } from '../pin';


describe('Control', () => {
  it('should be a `Pin`.', () => {
    new Control().should.be.instanceof(Pin);
  });

  it('should only send data when all of its inbound pins have sent data.', () => {
    let c = false;
    let a = new Source(); let b = new Source();

    group(a, b).to(new Control()).subscribe(() => c = true);

    a.send(); c.should.be.false;
    b.send(); c.should.be.true;
  });

  it('should again wait for all of its inbound pins for subsequent data.', () => {
    let c = 0;
    let a = new Source(); let b = new Source();
    group(a, b).to(new Control()).subscribe(() => c++);

    a.send(); b.send(); c.should.equal(1);
    a.send(); c.should.equal(1);
    b.send(); c.should.equal(2);
  });

  it('should send data when not connected to any pin.', done => {
    new Control().subscribe(() => done());
  });

  it('should aggregate incoming values.', done => {
    let a = new Source();
    let b = new Source();
    group(a, b).to(new Control()).subscribe(val => {
      val.sort().should.eql([1, 2]);
      done();
    });

    a.send(1);
    b.send(2);
  });

  it('should merge the context of incoming emissions.', done => {
    let a = new Source();
    let b = new Source();
    group(a, b).to(new Control()).observable.subscribe(emission => {
      emission.context.x.should.equal(2);
      emission.context.y.should.equal(3);
      done();
    });

    a.emit(emission(undefined, { x : 2 }));
    b.emit(emission(undefined, { y : 3 }));
  });
});
