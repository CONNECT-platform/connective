import { should } from 'chai'; should();

import emission from '../../shared/emission';

import source from '../../pin/source';
import pin from '../../pin/pin';
import map from '../../pin/map';
import filter from '../../pin/filter';

import handleError, { HandleError } from '../handle-error';


describe('HandleError', () => {
  it('should pass proper data normally.', () => {
    let a = source();
    let h = handleError();
    let res = <number[]>[];
    a.to(map((x: number) => x * 2)).to(h.input);
    h.output.to(pin()).subscribe(v => res.push(v));

    a.send(1);
    a.send(2);
    res.should.eql([2, 4]);
  });

  it('should skip emissions that result in error.', () => {
    let a = source();
    let h = handleError();
    let res = <number[]>[];
    a.to(map((x: number) => {
      if (x == 2) throw new Error();
      else return x * 2;
    })).to(h.input);
    h.output.to(pin()).subscribe(v => res.push(v));

    a.send(1);
    a.send(2);
    a.send(3);
    a.send(2);
    a.send(4);
    res.should.eql([2, 6, 8]);
  });

  it('should emit errors on its `.error` output.', () => {
    let a = source();
    let h = handleError();
    let res = 0;
    a.to(map((x: number) => {
      if (x == 2) throw new Error();
      else return x * 2;
    })).to(h.input);
    h.error.subscribe(() => res++);

    a.send(1);
    a.send(2);
    a.send(3);
    a.send(2);
    a.send(4);
    res.should.equal(2);
  });

  it('should maintain context on emitted errors from sync maps.', done => {
    let a = source();
    let h = handleError();

    a.to(map(() => { throw new Error() })).to(h.input);
    h.error.observable.subscribe(e => {
      e.context.x.should.equal(42);
      done();
    });

    a.emit(emission(undefined, { x : 42 }));
  });

  it('should maintain context on emitted errors from async maps.', done => {
    let a = source();
    let h = handleError();

    a.to(map((_, __, err) => { err(new Error()); })).to(h.input);
    h.error.observable.subscribe(e => {
      e.context.x.should.equal(42);
      done();
    });

    a.emit(emission(undefined, { x : 42 }));
  });

  it('should maintain context on emitted errors from sync filters.', done => {
    let a = source();
    let h = handleError();

    a.to(filter(() => { throw new Error() })).to(h.input);
    h.error.observable.subscribe(e => {
      e.context.x.should.equal(42);
      done();
    });

    a.emit(emission(undefined, { x : 42 }));
  });

  it('should maintain context on emitted errors from async filters.', done => {
    let a = source();
    let h = handleError();

    a.to(filter((_, __, err) => { err(new Error()); })).to(h.input);
    h.error.observable.subscribe(e => {
      e.context.x.should.equal(42);
      done();
    });

    a.emit(emission(undefined, { x : 42 }));
  });

  it('should share its incoming values.', () => {
    let a = source();
    let h = handleError();
    let e = 0;

    a.to(map((x: any) => {
      if (x == 2) throw new Error();
      else return x;
    }))
    .to(h.input);

    h.output.subscribe();
    h.error.subscribe(() => e++);

    a.send(1);
    a.send(2);
    a.send(3);

    e.should.equal(1);
  });
});


describe('handleError()', () => {
  it('should return an instanceof `HandleError`', () => {
    handleError().should.be.instanceof(HandleError);
  });
});
