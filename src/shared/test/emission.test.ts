import { should } from 'chai'; should();

import emission, { Emission, MergedEmissionContextVal } from '../emission';


describe('Emission', () => {
  describe('.fork()', () => {
    it('should create a new Emission with same context and updated value.', () => {
      let ctx = {x : 42};
      let a = new Emission(1, ctx).fork(2);
      a.value.should.equal(2);
      a.context.should.equal(ctx);
    });
  });
});

describe('Emission.from()', () => {
  it('should create a new emission from some other emissions, with the value being an array of original emissions.', () => {
    Emission.from([emission(42), emission(31)]).value.should.eql([42, 31]);
  });

  it('should accept a replacement value', () => {
    Emission.from([emission(42), emission(31)], 'well ...').value.should.equal('well ...');
  });

  it('should merge the context of original emissions', () => {
    let e = Emission.from([emission(null, {x: 42}), emission(null, {y: 31})]);
    e.context.x.should.equal(42);
    e.context.y.should.equal(31);
  });

  it('should store overriding context values in `MergedEmissionContextVal` objects referencing all original values.', () => {
    let e = Emission.from([emission(null, {x: 42}), emission(null, {x: 31})]);
    e.context.x.should.be.instanceof(MergedEmissionContextVal);
    e.context.x.values.should.eql([42, 31]);
  });

  it('should keep the context as flat as possible after chain mergers.', () => {
    let e = Emission.from([
      Emission.from([emission(null, {x: 42, z: 21}), emission(null, {x: 31, y: 3})]),
      Emission.from([emission(null, {y: 5, x: 'hellow'}), emission(null, {y: 6, x: 13})])
    ]);

    e.context.z.should.equal(21);
    e.context.x.values.should.eql([42, 31, 'hellow', 13]);
    e.context.y.values.should.eql([3, 5, 6]);
  });
});
