import { should } from 'chai'; should();

import emission from '../../shared/emission';

import { Source } from '../source';
import pin from '../pin';
import filter from '../filter';


describe('filter()', () => {
  it('should return a `PinLike` that only passes values that match the given function.', () => {
    let a = new Source<number>();
    let res: number[] = [];
    a.to(filter((n: number) => n % 2 == 0)).subscribe(x => res.push(x));
    a.send(1); a.send(2);
    a.send(3); a.send(4);

    res.should.eql([2, 4]);
  });

  it('should also work with an async function.', () => {
    let a = new Source();
    let res: number[] = [];
    a.to(filter((n: number, c: (r: boolean)=>void) => c(n % 2 == 1))).subscribe(x => res.push(x));
    a.send(1); a.send(2);
    a.send(3); a.send(4);

    res.should.eql([1, 3]);
  });

  it('should hanlde errors of a sync function.', done => {
    let a = new Source();
    a.to(filter(() => { throw new Error() })).subscribe(() => {}, () => done());
    a.send();
  });

  it('should provide an async function with an error callback.', done => {
    let a = new Source();
    a.to(filter((_: any, __: any, err: any) => { err(new Error()); })).subscribe(() => {}, () => done());
    a.send();
  });

  it('should not share a sync func.', () => {
    let a = new Source(); let r = 0;
    a.to(filter(() => r+=1)).to(pin(), pin()).subscribe();
    a.send();
    r.should.equal(2);
  });

  it('should share an async func.', () => {
    let a = new Source(); let r = 0;
    a.to(filter((_, done) => done(!!(r+=1)))).to(pin(), pin()).subscribe();
    a.send();
    r.should.equal(1);
  });

  it('should provide the async function also with context.', done => {
    let a = new Source();
    a.to(filter((_, __, ___, ctx) => {
      ctx.x.should.equal(2);
      done();
    })).subscribe();

    a.emit(emission(42, {x: 2}));
  });
});
