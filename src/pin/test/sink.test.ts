import { should } from 'chai'; should();

import { of } from 'rxjs';

import sink from '../sink';
import wrap from '../wrap';
import { Source } from '../source';
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

  it('should not invoke the function after `.clear()`', () => {
    let c = 0;
    let a = new Source();
    let s1 = sink(() => c++).from(a);
    let s2 = sink(() => c++).from(a);

    a.send();
    c.should.equal(0);

    s1.bind();
    a.send();
    c.should.equal(1);

    s2.bind();
    a.send();
    c.should.equal(3);

    s1.clear();
    a.send();
    c.should.equal(4);
  });
});
