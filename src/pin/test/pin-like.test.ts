import { should } from 'chai'; should();

import { Observable } from 'rxjs';

import { pin } from '../pin';
import { isPinLike } from '../pin-like';


describe('isPinLike()', () => {
  it('should return true for objects that are `PinLike` and false for those who are not.', () => {
    isPinLike({
      from() {}, to() {}, subscribe() {},
      observable: new Observable()
    }).should.be.true;

    isPinLike({
      from() {}, subscribe() {},
      observable: new Observable()
    }).should.be.false;

    isPinLike({
      from() {}, to() {},
      observable: new Observable()
    }).should.be.false;

    isPinLike({
      from() {}, to() {}, subscribe() {},
    }).should.be.false;

    isPinLike({}).should.be.false;
    isPinLike(undefined).should.be.false;
  });

  it('should not realize the observable of the pin-like.', () => {
    let p = pin();
    p.locked.should.be.false;
    isPinLike(p);
    p.locked.should.be.false;
  });
});
