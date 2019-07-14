import { should } from 'chai'; should();

import group from '../../pin/group';
import source from '../../pin/source';
import fork from '../../pin/fork';
import map from '../../pin/map';

import join, { peekJoin, Join } from '../join';


describe('Join', () => {
  it('should join all values from the same forked emission.', done => {
    let res = <{x: number, y: number}[]>[];
    let a = source();
    let f = a.to(fork());
    let j = join('x', 'y');
    f.to(j.in('x'));
    f.to(map((y, done) => setTimeout(() => done(y * 10), 20 - y * 5))).to(j.in('y'));

    j.output.subscribe(v => {
      res.push(v);
      if (res.length == 2) {
        res[0].should.eql({x: 2, y: 20});
        res[1].should.eql({x: 1, y: 10});
        done();
      }
    });

    a.send(1);
    a.send(2);
  });

  it('should work properly with chain fork/joins.', done => {
    let res = <any[]>[];
    let a = source();
    let f1 = a.to(fork());
    let f2 = f1.to(fork());
    let j1 = join('xy', 'z');
    let j2 = join('x', 'y');

    f2.to(j2.in('x'));
    f2.to(map((y, done) => setTimeout(() => done(y * 10), 20 - y * 5))).to(j2.in('y'));
    j2.output.to(j1.in('xy'));

    f1.to(map((z, done) => setTimeout(() => done(z * 100), z))).to(j1.in('z'));

    j1.output.subscribe(v => {
      res.push(v);
      if (res.length == 2) {
        res[0].should.eql({xy: {x: 2, y: 20}, z: 200});
        res[1].should.eql({xy: {x: 1, y: 10}, z: 100});
        done();
      }
    });

    a.send(1);
    a.send(2);
  });

  it('should not pop the fork tags when `pop=false` is set.', done => {
    let res = <any[]>[];
    let a = source();
    let f = a.to(fork());
    let j1 = join('xy', 'z');
    let j2 = peekJoin('x', 'y');

    f.to(j2.in('x'));
    f.to(map((y, done) => setTimeout(() => done(y * 10), 20 - y * 5))).to(j2.in('y'));
    j2.output.to(j1.in('xy'));

    f.to(map((z, done) => setTimeout(() => done(z * 100), z))).to(j1.in('z'));

    j1.output.subscribe(v => {
      res.push(v);
      if (res.length == 2) {
        res[0].should.eql({xy: {x: 2, y: 20}, z: 200});
        res[1].should.eql({xy: {x: 1, y: 10}, z: 100});
        done();
      }
    });

    a.send(1);
    a.send(2);
  });

  it('should work re-emit cross-fork joins based on number of forks.', () => {
    let res = <any[]>[];
    let a = source();
    let f1 = a.to(fork());
    let f2 = a.to(fork());
    let j = join('x', 'y');

    group(f1, f2).to(j.in('x'));
    f1.to(map((x: any) => x * 2)).to(j.in('y'));
    f2.to(map((x: any) => x * 3)).to(j.in('y'));

    j.output.subscribe(v => res.push(v));

    a.send(1);
    res[0].should.eql({x: 1, y: 2});
    res[1].should.eql({x: 1, y: 3});
  });

  it('should properly join cross-forked emissions.', () => {
    let res = <any[]>[];
    let a = source();
    let f1 = a.to(fork());
    let f2 = a.to(fork());
    let m = map((x: any) => x * 10);
    let j1 = join('x', 'y');
    let j2 = join('z', 'w');

    f1.to(j1.in('x'));
    group(f1, f2).to(m).to(j1.in('y'), j2.in('z'));
    f2.to(j2.in('w'));
    j1.output.subscribe(v => res.push(v));
    j2.output.subscribe(v => res.push(v));

    a.send(1);
    res[0].should.eql({x: 1, y: 10});
    res[1].should.eql({z: 10, w: 1});
  });
});

describe('join()', () => {
  it('should return a `Join` with `pop=true`', () => {
    let j = join();
    j.should.be.instanceof(Join);
    j.pop.should.be.true;
  });
});

describe('peekJoin()', () => {
  it('should return a `Join` with `pop=false`', () => {
    let j = peekJoin();
    j.should.be.instanceof(Join);
    j.pop.should.be.false;
  });
});
