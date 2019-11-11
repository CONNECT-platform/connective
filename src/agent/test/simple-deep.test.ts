import { should } from 'chai'; should();

import { SimpleDeep } from '../simple-deep';
import { State } from '../state';

import { testStateSpec } from './state.spec';


describe('SimpleDeep', () => {
  describe('state-like behaviour', () => {
    testStateSpec((...args: any[]) => new SimpleDeep(new State(...args)));
  });

  describe('.sub()', () => {
    it('should be an instance of `SimpleDeep`', () => {
      let s = new SimpleDeep(new State());
      s.sub('x').should.be.instanceof(SimpleDeep);
    });

    it('should have the value of given index on parent state.', () => {
      let s = new SimpleDeep(new State([42, 43, 44]));
      let sub = s.sub(1).bind();
      sub.value.should.equal(43);
      s.value = [42, 45, 44];
      sub.value.should.equal(45);
    });

    it('should reemit when the value of given index on parent state changes.', () => {
      let s = new SimpleDeep(new State([42, 43, 44]));
      let sub = s.sub(1).bind();
      let r = 0; sub.subscribe(() => r++);
      r.should.equal(1); // --> initial value

      s.value = [45, 43, 46];
      r.should.equal(1); // --> no change

      s.value = [45, 44, 46];
      r.should.equal(2); // --> change
    });

    it('should cause the parent state to reemit when a bound index sub\'s value changes.', () => {
      let s = new SimpleDeep(new State([42, 43, 44]));
      let sub = s.sub(1).bind();
      let r = 0; s.subscribe(() => r++);
      r.should.equal(1);

      sub.value = 46;
      s.value.should.eql([42, 46, 44]);
      r.should.equal(2);
    });

    it('should sync value of different subs with same index.', () => {
      let s = new SimpleDeep(new State([42, 43, 44]));
      let sub = s.sub(1).bind();
      let sub2 = s.sub(1).bind();

      sub.value = 46;
      sub2.value.should.equal(46);
    });

    it('should efficiently sync value of different subs with same index.', () => {
      let s = new SimpleDeep(new State([42, 43, 44]));
      let sub = s.sub(1).bind();
      let sub2 = s.sub(1).bind();
      let r = 0; sub2.subscribe(() => r++);
      r.should.equal(1); // --> initial value

      s.value = [46, 43, 47];
      r.should.equal(1); // --> no change

      sub.value = 46;
      r.should.equal(2); // --> change
    });

    it('should have the value of given property on parent state.', () => {
      let s = new SimpleDeep(new State('hellow'));
      let sub = s.sub('length').bind();
      sub.value.should.equal(6);
      s.value = 'world';
      sub.value.should.equal(5);
    });

    it('should reemit when the value of given property on parent state changes.', () => {
      let s = new SimpleDeep(new State('hellow'));
      let sub = s.sub('length').bind();
      let r = 0; sub.subscribe(() => r++);
      r.should.equal(1); // --> initial value

      s.value = 'world!';
      r.should.equal(1); // --> no change

      s.value = 'world';
      r.should.equal(2); // --> change
    });

    it('should cause the parent state to reemit when a property index sub\'s value changes.', () => {
      let s = new SimpleDeep(new State({x: 2, y: 3}));
      let sub = s.sub('x').bind();
      let r = 0; s.subscribe(() => r++);
      r.should.equal(1);

      sub.value = 46;
      s.value.should.eql({x: 46, y: 3});
      r.should.equal(2);
    });

    it('should sync value of different subs with same index.', () => {
      let s = new SimpleDeep(new State({x: 2, y: 3}));
      let sub = s.sub('x').bind();
      let sub2 = s.sub('x').bind();

      sub.value = 46;
      sub2.value.should.equal(46);
    });

    it('should efficiently sync value of different subs with same index.', () => {
      let s = new SimpleDeep(new State({x: 2, y: 3}));
      let sub = s.sub('x').bind();
      let sub2 = s.sub('x').bind();
      let r = 0; sub2.subscribe(() => r++);
      r.should.equal(1); // --> initial value

      s.value = {x: 2, y: 42};
      r.should.equal(1); // --> no change

      sub.value = 46;
      r.should.equal(2); // --> change
    });
  });
});