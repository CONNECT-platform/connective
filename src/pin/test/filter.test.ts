import { should } from 'chai'; should();

import emission from '../../shared/emission';

import { Source } from '../source';
import pin from '../pin';
import filter from '../filter';


describe('filter()', () => {
  it('should return a `PinLike` that only passes values that match the given function.', () => {
    let a = new Source();
    let f = filter((n: number) => n % 2 == 0).from(a);
    let res: number[] = [];
    f.subscribe(x => res.push(x));
    a.send(1); a.send(2);
    a.send(3); a.send(4);

    res.should.eql([2, 4]);
  });

  it('should also work with an async function.', () => {
    let a = new Source();
    let f = filter((n: number, c: (r: boolean)=>void) => c(n % 2 == 1)).from(a);
    let res: number[] = [];
    f.subscribe(x => res.push(x));
    a.send(1); a.send(2);
    a.send(3); a.send(4);

    res.should.eql([1, 3]);
  });

  it('should hanlde errors of a sync function.', done => {
    let a = new Source();
    let f = filter(() => { throw new Error() }).from(a);
    f.subscribe(() => {}, () => done());
    a.send();
  });

  it('should provide an async function with an error callback.', done => {
    let a = new Source();
    let f = filter((_: any, __: any, err: any) => { err(new Error()); }).from(a);
    f.subscribe(() => {}, () => done());
    a.send();
  });

  it('should not share a sync func.', () => {
    let a = new Source(); let r = 0;
    let m = filter(() => r+=1).from(a);
    let p1 = pin().from(m); let p2 = pin().from(m);
    p1.subscribe(); p2.subscribe();
    a.send();
    r.should.equal(2);
  });

  it('should share an async func.', () => {
    let a = new Source(); let r = 0;
    let m = filter((_, done) => done(!!(r+=1))).from(a);
    let p1 = pin().from(m); let p2 = pin().from(m);
    p1.subscribe(); p2.subscribe();
    a.send();
    r.should.equal(1);
  });

  it('should provide the async function also with context.', done => {
    let a = new Source();
    let f = filter((_, __, ___, ctx) => {
      ctx.x.should.equal(2);
      done();
    }).from(a);

    f.subscribe(() => {});
    a.emit(emission(42, {x: 2}));
  });
});
