import { should } from 'chai'; should();

import source from '../source';
import spread from '../spread';


describe('spread()', () => {
  it('should spread an array into separate emissions.', () => {
    let r = <number[]>[];
    let a = source();
    a.to(spread()).subscribe(v => r.push(v));
    a.send([1, 2, 3]);
    r.should.eql([1, 2, 3]);
  });

  it('should simply pass on values that are not arrays.', done => {
    let a = source();
    a.to(spread()).subscribe(v => {
      v.should.equal(42);
      done();
    });

    a.send(42);
  });
});
