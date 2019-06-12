import { should, expect } from 'chai'; should();

import { from, of } from 'rxjs';

import lazy from '../lazy';
import { Pin } from '../pin';


describe('lazy()', () => {
  it('should return a `PinLike` wrapping a given to-be-observable.', done => {
    let p = lazy(() => of('hellow'));

    p.observable.subscribe(data => {
      data.should.equal('hellow');
      done();
    });
  });

  it('should return a `PinLike` that cannot be connected to.', () => {
    expect(() => lazy(() => of(42)).from(new Pin())).to.throw();
  });

  it('should return a `PinLike` that can connect to other pins.', () => {
    let _ : number[] = [];
    new Pin()
      .from(lazy(() => of(1)))
      .from(lazy(() => from([2, 3, 4])))
      .observable.subscribe(n => _.push(n));
    _.should.have.members([4, 3, 2, 1]);
  });
});
