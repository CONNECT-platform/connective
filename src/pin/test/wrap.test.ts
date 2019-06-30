import { should, expect } from 'chai'; should();

import { from, of } from 'rxjs';

import wrap from '../wrap';
import { Pin } from '../pin';


describe('wrap()', () => {
  it('should return a `PinLike` wrapping a given observable.', done => {
    let p = wrap(of('hellow'));

    p.subscribe(data => {
      data.should.equal('hellow');
      done();
    });
  });

  it('should return a `PinLike` that cannot be connected to.', () => {
    expect(() => wrap(of(42)).from(new Pin())).to.throw();
  });

  it('should return a `PinLike` that can connect to other pins.', () => {
    let _ : number[] = [];
    new Pin()
      .from(wrap(of(1)))
      .from(wrap(from([2, 3, 4])))
      .subscribe(n => _.push(n));
    _.should.have.members([4, 3, 2, 1]);
  });
});
