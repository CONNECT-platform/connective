import { should, expect } from 'chai'; should();

import { from, of } from 'rxjs';

import group from '../group';
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

    group(
      wrap(of(1)),
      wrap(from([2, 3, 4]))
    )
    .to(new Pin())
    .subscribe(n => _.push(n));

    _.should.have.members([4, 3, 2, 1]);
  });
});
