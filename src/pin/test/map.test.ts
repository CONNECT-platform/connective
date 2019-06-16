import { should } from 'chai'; should();

import { Source } from '../source';
import map from '../map';


describe('map()', () => {
  it('should return a `PinLike` that maps any passed value by given function.', () => {
    let a = new Source();
    let f = map((n: number) => n * 2).from(a);
    let res: number[] = [];
    f.observable.subscribe(n => res.push(n));
    a.send(1);
    a.send(2);
    res.should.eql([2, 4]);
  });

  it('should also work with an async function.', () => {
    let a = new Source();
    let f = map((n: number, cb: any) => cb(n * 2 + 1)).from(a);
    let res: number[] = [];
    f.observable.subscribe(x => res.push(x));
    a.send(1); a.send(2);

    res.should.eql([3, 5]);
  });

  it('should keep the order for an async map.', done => {
    let a = new Source();
    let f = map((n: number, cb: any) => setTimeout(() => cb(n * 2 + 1), 5 - n)).from(a);
    let res: number[] = [];
    f.observable.subscribe(
      x => res.push(x),
      () => {},
      () => {
        res.should.eql([3, 5]);
        done();
      }
    );

    a.send(1); a.send(2); a.clear();
  });

  it('should hanlde errors of a sync function.', done => {
    let a = new Source();
    let f = map(() => { throw new Error() }).from(a);
    f.observable.subscribe(() => {}, () => done());
    a.send();
  });

  it('should provide an async function with an error callback.', done => {
    let a = new Source();
    let f = map((_: any, __: any, err: any) => { err(new Error()); }).from(a);
    f.observable.subscribe(() => {}, () => done());
    a.send();
  });
});
