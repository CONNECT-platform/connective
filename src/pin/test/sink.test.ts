import { should } from 'chai'; should();

import { of } from 'rxjs';

import sink from '../sink';
import wrap from '../wrap';
import { Pin } from '../pin';


describe('sink()', () => {
  it('should be a lock the connected graph before it when its `.bind()` is called.', () => {
    let s = sink();
    let a = new Pin().to(new Pin().to(s), new Pin().to(s));
    s.bind();
    a.locked.should.be.true;
  });

  it('should invoke the given sink func upon `.bind()`', done => {
    sink((val: any) => {
      val.should.equal(42);
      done();
    })
    .from(wrap(of(42)))
    .bind();
  });
});
