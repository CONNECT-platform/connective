import { should } from 'chai'; should();

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

    new Control().from(a).from(b).observable.subscribe(() => c = true);

    a.send(); c.should.be.false;
    b.send(); c.should.be.true;
  });

  it('should again wait for all of its inbound pins for subsequent data.', () => {
    let c = 0;
    let a = new Source(); let b = new Source();
    new Control().from(a).from(b).observable.subscribe(() => c++);

    a.send(); b.send(); c.should.equal(1);
    a.send(); c.should.equal(1);
    b.send(); c.should.equal(2);
  });

  it('should send data when not connected to any pin.', done => {
    new Control().observable.subscribe(() => done());
  });
});
