import { should } from 'chai'; should();

import emission from '../../shared/emission';
import source from '../../pin/source';
import sink from '../../pin/sink';

import check, { Check } from '../check';


describe('Check', () => {
  it('should pass values passing given predicate through `.pass`, others through its `.fail`', () => {
    let a = source();
    let c = check((x: any) => x % 2 == 0);
    let passed = <number[]>[];
    let failed = <number[]>[];

    a.to(c.input);
    c.pass.subscribe(v => passed.push(v));
    c.fail.subscribe(v => failed.push(v));

    a.send(1); a.send(2); a.send(3); a.send(4);
    passed.should.eql([2, 4]);
    failed.should.eql([1, 3]);
  });

  it('should work properly with async predicates.', done => {
    let a = source();
    let c = check((x: any, done) => setTimeout(() => done(x % 2 == 0), 1));
    let passed = <number[]>[];
    let failed = <number[]>[];

    a.to(c.input);
    c.pass.subscribe(v => passed.push(v));
    c.fail.subscribe(v => failed.push(v));

    a.send(1); a.send(2); a.send(3); a.send(4);
    setTimeout(() => {
      passed.should.eql([2, 4]);
      failed.should.eql([1, 3]);
      done();
    }, 10);
  });

  it('should handle errors in sync predicates.', done => {
    let a = source();
    let c = check(() => { throw new Error('hellow') });
    a.to(c.input);
    c.pass.subscribe(() => {}, () => done());
    a.send();
  });

  it('should pass an error callback to async predicates.', done => {
    let a = source();
    let c = check((_: any, done, err) => err('hellow'));
    a.to(c.input);
    c.pass.subscribe(() => {}, () => done());
    a.send();
  });

  it('should provide the async predicate with context as well.', done => {
    let a = source();
    let c = check((_: any, __, ___, ctx) => {
      ctx.x.should.equal(42);
      done();
    });
    a.to(c.input);
    c.pass.subscribe();
    a.emit(emission(0, { x : 42 }));
  });

  it('should be serially connectible.', () => {
    let a = source();
    let odd = <number[]>[];
    let even = <number[]>[];

    a.to(check((x: number) => x % 2 == 0)).serialTo(
      sink(v => even.push(v)),
      sink(v => odd.push(v))
    ).subscribe();

    a.send(1); a.send(2); a.send(3); a.send(4);
    even.should.eql([2, 4]);
    odd.should.eql([1, 3]);
  });

  describe('.input', () => {
    it('should be equal to `.in("value")`', () => {
      let c = check(() => false);
      c.input.should.equal(c.in("value"));
    });
  });

  describe('.pass', () => {
    it('should be equal to `.out("pass")`', () => {
      let c = check(() => false);
      c.pass.should.equal(c.out("pass"));
    });
  });

  describe('.fail', () => {
    it('should be equal to `.out("fail")`', () => {
      let c = check(() => false);
      c.fail.should.equal(c.out("fail"));
    });
  });
});

describe('check()', () => {
  it('should create a `Check` with the given predicate.', () => {
    let f = () => false;
    let c = check(f);
    c.should.be.instanceOf(Check);
    c.predicate.should.equal(f);
  })
})
