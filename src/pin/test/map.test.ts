import { should } from 'chai'; should();

import emission from '../../shared/emission';

import { Source } from '../source';
import pin from '../pin';
import map from '../map';


describe('map()', () => {
  it('should return a `PinLike` that maps any passed value by given function.', () => {
    let a = new Source();
    let res: number[] = [];
    a.to(map((n: number) => n * 2)).subscribe(n => res.push(n));
    a.send(1);
    a.send(2);
    res.should.eql([2, 4]);
  });

  it('should also work with an async function.', () => {
    let a = new Source();
    let res: number[] = [];
    a.to(map((n: number, cb: any) => cb(n * 2 + 1))).subscribe(x => res.push(x));
    a.send(1); a.send(2);

    res.should.eql([3, 5]);
  });

  it('should not keep the order for an async map.', done => {
    let a = new Source();
    let res: number[] = [];
    a.to(map((n: number, cb: any) => setTimeout(() => cb(n * 2 + 1), 5 - n)))
     .subscribe(
      x => res.push(x),
      () => {},
      () => {
        res.should.eql([5, 3]);
        done();
      }
    );

    a.send(1); a.send(2); a.clear();
  });

  it('should hanlde errors of a sync function.', done => {
    let a = new Source();
    a.to(map(() => { throw new Error() })).subscribe(() => {}, () => done());
    a.send();
  });

  it('should provide an async function with an error callback.', done => {
    let a = new Source();
    a.to(map((_: any, __: any, err: any) => { err(new Error()); })).subscribe(() => {}, () => done());
    a.send();
  });

  it('should not share a sync func.', () => {
    let a = new Source(); let r = 0;
    a.to(map(() => r+=1)).to(pin(), pin()).subscribe();
    a.send();
    r.should.equal(2);
  });

  it('should share an async func.', () => {
    let a = new Source(); let r = 0;
    a.to(map((_, done) => done(r+=1))).to(pin(), pin()).subscribe();
    a.send();
    r.should.equal(1);
  });

  it('should provide an async function with context as well.', done => {
    let a = new Source();
    a.to(map((_, __, ___, ctx) => {
      ctx.x.should.equal(2);
      done();
    })).subscribe();

    a.emit(emission(42, {x: 2}));
  });
});
