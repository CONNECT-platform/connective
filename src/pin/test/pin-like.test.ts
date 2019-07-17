import { should } from 'chai'; should();

import { Observable } from 'rxjs';

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

    isPinLike({
      from() {}, to() {}, subscribe() {},
      observable: 42,
    }).should.be.false;

    isPinLike({}).should.be.false;
    isPinLike(undefined).should.be.false;
  });
});
