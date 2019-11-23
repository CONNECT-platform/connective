import { should, expect } from 'chai'; should();

import { KeyedDeep } from '../keyed-deep';
import { State } from '../state';
import { ChangeMap } from '../../util/keyed-array-diff';


describe('KeyedDeep', () => {
  describe('.key()', () => {
    it('should return a state with correct initial value even if unbound.', () => {
      let s = new KeyedDeep(new State([{id: 1, name: 'hellow'}, {id: 2, name: 'world'}]), _ => _.id);
      let k = s.key(1);
      expect(k.value).to.eql({id: 1, name: 'hellow'});
    });

    it('should have value of `undefined` when the given key is not in parent state even if unbound.', () => {
      let s = new KeyedDeep(new State([]), _ => _.id);
      let k = s.key(1);
      expect(k.value).to.be.undefined;
    });

    it('should have the correct value of given key in parent state.', () => {
      let s = new KeyedDeep(new State([{id: 1, name: 'Jack'}, {id: 2, name: 'Jill'}]), (_) => _.id);
      let k = s.key(1).bind();
      k.value.should.eql({id: 1, name: 'Jack'});
      s.value = [{id: 1, name: 'John'}, {id: 2, name: 'Jill'}];
      k.value.should.eql({id: 1, name: 'John'});
    });

    it('should reemit when the value with given key on parent state changes.', () => {
      let s = new KeyedDeep(new State([{id: 12, name: 'Jack'}, {id: 22, name: 'Jill'}]), (_) => _.id);
      let k = s.key(12).bind();
      let r = 0; k.subscribe(() => r++);
      r.should.equal(1); // --> initial value

      s.value = [{id: 20, name: 'John'}, {id: 12, name: 'Jack'}, {id: 22, name: 'Jill'}];
      r.should.equal(1); // --> no changes

      s.value = [{id: 20, name: 'John'}, {id: 12, name: 'Joseph'}, {id: 22, name: 'Jill'}];
      r.should.equal(2); // --> change
    });

    it('should cause the parent to reemit when the value of bound key changes.', () => {
      let s = new KeyedDeep(new State([{id: 12, name: 'Jack'}, {id: 22, name: 'Jill'}]), (_) => _.id);
      let k = s.key(12).bind();
      let r = 0; s.subscribe(() => r++);

      r.should.equal(1); // --> initial value

      k.value = {id: 12, name: 'Joseph'};
      s.value.should.eql([{id: 12, name: 'Joseph'}, {id: 22, name: 'Jill'}]);
      r.should.equal(2); // --> reemission
    });

    it('should not cause a reemit on parent when it receives a down-propagated value.', () => {
      let s = new KeyedDeep(new State([{id: 12, name: 'Jack'}, {id: 22, name: 'Jill'}]), (_) => _.id);
      let k = s.key(12).bind();
      let r = 0; s.subscribe(() => r++);

      r.should.equal(1); // --> initial value

    });

    it('should sync values of same key.', () => {
      let s = new KeyedDeep(new State([{id: 12, name: 'Jack'}, {id: 22, name: 'Jill'}]), (_) => _.id);
      let k1 = s.key(12).bind();
      let k2 = s.key(12).bind();

      k1.value = { id: 12, name: 'Josh' };
      k2.value.name.should.equal('Josh');
    });

    it('should efficiently sync values of same key.', () => {
      let s = new KeyedDeep(new State([{id: 12, name: 'Jack'}, {id: 22, name: 'Jill'}]), (_) => _.id);
      let k1 = s.key(12).bind();
      let k2 = s.key(12).bind();
      let r = 0; k2.subscribe(() => r++);
      r.should.equal(1); // --> initial value

      s.value = [{id: 12, name: 'Jack'}, {id: 22, name: 'Jeff'}];
      r.should.equal(1); // --> no change

      k1.value = {id: 12, name: 'Josh'};
      r.should.equal(2); // --> no change
    });

    it('should propagate changes in grandchild states to grandparents as well.', () => {
      let gp = new KeyedDeep(new State([{id: 12, name: 'Jack'}, {id: 22, name: 'Jill'}]), (_) => _.id);
      let c = gp.key(12).bind();
      let gc = c.sub('name').bind();
      let r = 0; gp.subscribe(() => r++);
      r.should.equal(1); // --> initial value

      let r2 = 0; c.subscribe(() => r2++);
      r2.should.equal(1); // --> initial value

      gc.value = 'Jeff';
      r2.should.equal(2); // --> change
      r.should.equal(2); // --> change
      c.value.should.eql({id: 12, name: 'Jeff'});
      gp.value.should.eql([{id: 12, name: 'Jeff'}, {id: 22, name: 'Jill'}]);
    });

    it('should keep values of grandchild states sync.', () => {
      let gp = new KeyedDeep(new State([{id: 12, name: 'Jack'}, {id: 22, name: 'Jill'}]), (_) => _.id);
      let gc1 = gp.key(12).bind().sub('name').bind();
      let gc2 = gp.key(12).bind().sub('name').bind();

      gc1.value = 'Jeff';
      gc2.value.should.equal('Jeff');
    });

    it('should sync values of grandchild states efficiently.', () => {
      let gp = new KeyedDeep(new State([{id: 12, name: 'Jack'}, {id: 22, name: 'Jill'}]), (_) => _.id);
      let r = 0; gp.subscribe(() => r++);

      let c1 = gp.key(12).bind(); let rc1 = 0; c1.subscribe(() => rc1++);
      let gc1 = c1.sub('name').bind(); let rgc1 = 0; gc1.subscribe(() => rgc1++);

      let c2 = gp.key(12).bind(); let rc2 = 0; c2.subscribe(() => rc2++);
      let gc2 = c2.sub('name').bind(); let rgc2 = 0; gc2.subscribe(() => rgc2++);

      r.should.equal(1); // --> initial value
      rc1.should.equal(1); 
      rgc1.should.equal(1);
      rc2.should.equal(1);
      rgc2.should.equal(1);

      c2.value = {id: 12, name: 'Jeff'};
      r.should.equal(2);
      rc1.should.equal(2);
      rgc1.should.equal(2);
      rc2.should.equal(2);
      rgc2.should.equal(2);

      gc1.value = 'John';
      r.should.equal(3);
      rc1.should.equal(3);
      rgc1.should.equal(3);
      rc2.should.equal(3);
      rgc2.should.equal(3);
    });
  });

  describe('.index()', () => {
    it('should emit the index of the given key in the array.', () => {
      let s = new KeyedDeep(new State([{id: 'john'}, {id: 'jack'}]), (_) => _.id);
      let r = <string[]>[];
      s.index('john').subscribe(v => r.push(v));
      s.value = [{id: 'jack'}, {id: 'john'}];

      r.should.eql(['0', '1']);
    });

    it('should be -1 when the key is not in the array', () => {
      let s = new KeyedDeep(new State([{id: 'jack'}]), (_) => _.id);
      let r = <string[]>[];
      s.index('john').subscribe(v => r.push(v));
      s.value = [{id: 'jack'}, {id: 'john'}];
      s.value = [];
      r.should.eql([-1, '1', -1]);
    });

    it('should only emit when the index changes, regardless of value changes.', () => {
      let s = new KeyedDeep(new State([{id: 'john', age: 23}, {id: 'jack', age: 24}]), (_) => _.id);
      let r = <string[]>[];
      s.index('john').subscribe(v => r.push(v));

      r.should.eql(['0']); // --> initial index

      s.value = [{id: 'john', age: 23}, {id: 'jill', age: 24}, {id: 'jack', age: 24}];
      r.should.eql(['0']); // --> no change in index

      s.value = [{id: 'john', age: 26}, {id: 'jill', age: 24}, {id: 'jack', age: 24}];
      r.should.eql(['0']); // --> no change in index yet

      s.value = [{id: 'jill', age: 24}, {id: 'jack', age: 24}, {id: 'john', age: 26}];
      r.should.eql(['0', '2']); // --> index change
    });
  });

  describe('.keys', () => {
    it('should be an empty array for an unbound state.', () => {
      let s = new KeyedDeep(new State([{id: 'john', age: 23}, {id: 'jack', age: 24}]), (_) => _.id);
      s.keys.should.eql([]);
    });

    it('should contain all of the keys of the state.', () => {
      let s = new KeyedDeep(new State([{id: 'john', age: 23}, {id: 'jack', age: 24}]), (_) => _.id);
      s.bind();
      s.keys.should.have.deep.members(['john', 'jack']);

      s.value = [{id: 'john', age: 23}, {id: 'jack', age: 24}, {id: 'jill', age: 25}];
      s.keys.should.have.deep.members(['john', 'jack', 'jill']);

      s.value = [{id: 'jack', age: 24}, {id: 'jill', age: 25}];
      s.keys.should.have.deep.members(['jack', 'jill']);
    });
  });

  describe('.changes', () => {
    it('should emit whenever the state changes.', () => {
      let s = new KeyedDeep(new State([{id: 'john', age: 23}, {id: 'jack', age: 24}]), (_) => _.id);
      let k = s.key('john').bind();
      let r = 0; s.changes.subscribe(() => r++);

      r.should.equal(0);

      k.value = {id: 'john', age: 26};
      r.should.equal(0); // --> no changes

      s.value = [{id: 'john', age: 26}, {id: 'jill', age: 27}];
      r.should.equal(1);
    });

    it('should emit once containing the initial additions for the initial value of the state', (done) => {
      let s = new KeyedDeep(new State([{id: 'john', age: 23}, {id: 'jack', age: 24}]), (_) => _.id);
      s.changes.subscribe((changes: ChangeMap) => {
        changes.additions.should.have.deep.members([
          { index: '0', item: {id: 'john', age: 23}},
          { index: '1', item: {id: 'jack', age: 24}},
        ]);
        done();
      });
    });

    it('should emit for subsequent additions to the indices of the state.', (done) => {
      let s = new KeyedDeep(new State([{id: 'john', age: 23}, {id: 'jack', age: 24}]), (_) => _.id);
      s.bind(); // --> preventing the initial state to be considered changes

      s.changes.subscribe((changes: ChangeMap) => {
        changes.additions.should.have.deep.members([{
          index: '2',
          item: { id: 'jill', age: 27 }
        }]);

        done();
      });

      s.value = s.value.concat([{id: 'jill', age: 27}]);
    });

    it('should emit deletions from the indices of the state.', (done) => {
      let s = new KeyedDeep(new State([{id: 'john', age: 23}, {id: 'jack', age: 24}]), (_) => _.id);
      s.bind(); // --> preventing the initial state to be considered changes

      s.changes.subscribe((changes: ChangeMap) => {
        changes.deletions.should.have.deep.members([
          {
            index: '0',
            item: {id: 'john', age: 23}
          }
        ]);
        done();
      });

      s.value = s.value.filter((i: any) => i.id != 'john');
    });

    it('should emit moving of indices of the state.', (done) => {
      let s = new KeyedDeep(new State([{id: 'john', age: 23}, {id: 'jack', age: 24}]), (_) => _.id);
      s.bind(); // --> preventing the initial state to be considered changes

      s.changes.subscribe((changes: ChangeMap) => {
        changes.moves.should.have.deep.members([{
          oldIndex: '0',
          newIndex: '1',
          item: {id: 'john', age: 23}
        }, {
          oldIndex: '1',
          newIndex: '0',
          item: {id: 'jack', age: 24}
        }]);

        done();
      });

      s.value = [{id: 'jack', age: 24}, {id: 'john', age: 23}];
    });

    it('should emit moving of indices of the state as a result of deletions.', (done) => {
      let s = new KeyedDeep(new State([{id: 'john', age: 23}, {id: 'jack', age: 24}]), (_) => _.id);
      s.bind(); // --> preventing the initial state to be considered changes

      s.changes.subscribe((changes: ChangeMap) => {
        changes.moves.should.have.deep.members([{
          oldIndex: '1',
          newIndex: '0',
          item: {id: 'jack', age: 24}
        }]);
        done();
      });

      s.value = s.value.filter((i: any) => i.id != 'john');
    });

    it('should emit moving of indices of the state as a result of additions.', (done) => {
      let s = new KeyedDeep(new State([{id: 'john', age: 23}]), (_) => _.id);
      s.bind(); // --> preventing the initial state to be considered changes

      s.changes.subscribe((changes: ChangeMap) => {
        changes.moves.should.have.deep.members([{
          oldIndex: '0',
          newIndex: '1',
          item: {id: 'john', age: 23}
        }]);
        done();
      });

      s.value = [{id: 'jack', age: 24}].concat(s.value);
    });
  });
});