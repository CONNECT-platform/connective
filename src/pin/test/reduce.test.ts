import { should } from 'chai'; should();

import emission from '../../shared/emission';

import reduce from '../reduce';
import source from '../source';
import pin from '../pin';


describe.only('reduce()', () => {
  it('should reduce incoming values based on given starting value and reduce function.', () => {
    let res = <number[]>[];

    let a = source();
    a.to(reduce((x: number, y: number) => x + y, 0)).subscribe(v => res.push(v));

    a.send(1);
    a.send(2);
    a.send(3);
    res.should.eql([1, 3, 6]);
  });

  it('should assume the first value as the starting value if no starting value is provided.', () => {
    let res = <number[]>[];

    let a = source();
    a.to(reduce((x: number, y: number) => x * y)).subscribe(v => res.push(v));

    a.send(1);
    a.send(2);
    a.send(3);
    res.should.eql([1, 2, 6]);
  });

  it('should work properly with async reduce functions as well.', () => {
    let res = <number[]>[];

    let a = source();
    a.to(reduce((x: number, y: number, cb) => cb(x * y))).subscribe(v => res.push(v));

    a.send(1);
    a.send(2);
    a.send(3);
    res.should.eql([1, 2, 6]);
  });

  it('should handle errors of a sync function.', done => {
    let a = source();
    a.to(reduce(() => { throw new Error() })).subscribe(() => {}, () => done());
    a.send(); a.send();
  });

  it('should provide an async func with an error callback.', done => {
    let a = source();
    a.to(reduce((_: any, __:any, ___: any, err: any) => { err(new Error()); })).subscribe(() => {}, () => done());
    a.send(); a.send();
  });

  it('should not share the sync func.', () => {
    let a = source(); let r = 0;
    a.to(reduce(() => r+=1)).to(pin(), pin()).subscribe();
    a.send(); a.send();
    r.should.equal(3);
  });

  it('should share an async func.', () => {
    let a = source(); let r = 0;
    a.to(reduce((_, __, done) => done(r+=1))).to(pin(), pin()).subscribe();
    a.send(); a.send();
    r.should.equal(1);
  });

  it('should provide an async function with context of emission and inbound as well.', done => {
    let a = source();
    a.to(reduce((_, __, ___, ____, ctx, accCtx) => {
      accCtx.x.should.equal(2);
      ctx.y.should.equal(3);
      done();
    })).subscribe();

    a.emit(emission(42, {x: 2}));
    a.emit(emission(42, {y: 3}));
  });
});
