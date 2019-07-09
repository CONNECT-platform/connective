import { should, expect } from 'chai'; should();

import group from '../group';
import { Source } from '../source';
import { Pin } from '../pin';
import value from '../value';


describe('value()', () => {
  it('should be a `Pin`.', () => {
    value(42).should.be.instanceof(Pin);
  });

  it('should only send given value when all of its inbound pins have sent data.', () => {
    let c = undefined;
    let a = new Source(); let b = new Source();

    group(a, b).to(value('hellow')).subscribe(val => c = val);

    a.send(); expect(c).to.be.undefined;
    b.send(); expect(c).to.equal('hellow');
  });

  it('should again wait for all of its inbound pins for subsequently resending its value.', () => {
    let c = 0;
    let a = new Source(); let b = new Source();
    group(a, b).to(value(3)).subscribe(v => c += v);

    a.send(); b.send(); c.should.equal(3);
    a.send(); c.should.equal(3);
    b.send(); c.should.equal(6);
  });

  it('should send its value when not connected to any pin.', done => {
    value(42).subscribe(val => {
      val.should.equal(42);
      done();
    });
  });
});
