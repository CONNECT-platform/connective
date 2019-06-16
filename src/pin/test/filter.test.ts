import { should } from 'chai'; should();

import { Source } from '../source';
import filter from '../filter';


describe('filter()', () => {
  it('should return a `PinLike` that only passes values that match the given function.', () => {
    let a = new Source();
    let f = filter((n: number) => n % 2 == 0).from(a);
    let res: number[] = [];
    f.observable.subscribe(x => res.push(x));
    a.send(1); a.send(2);
    a.send(3); a.send(4);

    res.should.eql([2, 4]);
  });

  it('should also work with an async function.', () => {
    let a = new Source();
    let f = filter((n: number, c: (r: boolean)=>void) => c(n % 2 == 1)).from(a);
    let res: number[] = [];
    f.observable.subscribe(x => res.push(x));
    a.send(1); a.send(2);
    a.send(3); a.send(4);

    res.should.eql([1, 3]);
  });

  it('should hanlde errors of a sync function.', done => {
    let a = new Source();
    let f = filter(() => { throw new Error() }).from(a);
    f.observable.subscribe(() => {}, () => done());
    a.send();
  });

  it('should provide an async function with an error callback.', done => {
    let a = new Source();
    let f = filter((_: any, __: any, err: any) => { err(new Error()); }).from(a);
    f.observable.subscribe(() => {}, () => done());
    a.send();cl
  });
});
