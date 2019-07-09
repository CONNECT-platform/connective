import { should } from 'chai'; should();

import { ErrorCallback, ContextType } from '../../shared/types';
import emission from '../../shared/emission';

import { Node } from '../node';
import { Expr } from '../expr';
import expr from '../expr';

import { Source } from '../../pin/source';


describe('Expr', () => {
  it('should be a subclass of Node.', () => {
    new Expr(() => {}).should.be.instanceof(Node);
  });

  it('should run given function.', done => {
    let e = new Expr(['a', 'b'], (a: any, b: any) => a + b);
    let a = new Source(); a.to(e.in('a'));
    let b = new Source(); b.to(e.in('b'));
    e.result.subscribe(res => {
      res.should.equal(5);
      done();
    });

    a.send(2);
    b.send(3);
  });

  it('should throw an error if not all parameters are provided.', done => {
    new Expr(['a'], (a: any) => a).
      result.subscribe(() => {}, () => done());
  });

  it('should run given function instantly if no inputs are outlined.', done => {
    new Expr(() => true).result.subscribe(() => done());
  });

  it('should pass the proper error callback to the function.', done => {
    new Expr((error: ErrorCallback) => error('hellow')).
      result.subscribe(() => {}, () => done());
  });

  it('should also pass the context to the function.', done => {
    let e = new Expr(['i'], (_, __, ctx: ContextType) => {
      ctx.name.should.equal('the dude');
      done();
    });

    let a = new Source(); a.to(e.in('i'));
    e.result.subscribe();
    a.emit(emission('whatever', {name: 'the dude'}));
  });

  it('should run the result of the function as an async callback if the result is a function itself.', done => {
    new Expr(() => (done: any) => done('hellow')).
      result.subscribe(res => {
        res.should.equal('hellow');
        done();
      });
  });

  it('should also provide the proper error callback to the async callback.', done => {
    new Expr(() => (_: any, err: ErrorCallback) => err('yup')).
      result.subscribe(() => {}, () => done());
  });

  describe('.result', () => {
    it('should be equal to `.out("result")`', () => {
      let e = new Expr(() => {});
      e.result.should.equal(e.out('result'));
    });
  });
});

describe('expr()', () => {
  it('should return a proper Expr.', done => {
    let e = expr(['a', 'b'], (a: any, b: any) => a * b);
    e.should.be.instanceof(Expr);

    let a = new Source(); a.to(e.in('a'));
    let b = new Source(); b.to(e.in('b'));
    e.result.subscribe(res => {
      res.should.equal(6);
      done();
    });

    a.send(2);
    b.send(3);
  });

  it('should create numeric inputs for the signature if no named inputs are given but the given function has inputs.', done => {
    let e = expr((a: any, b: any) => b - a);
    let a = new Source(); a.to(e.in(0));
    let b = new Source(); b.to(e.in(1));

    e.result.subscribe(val => {
      val.should.equal(1);
      done();
    });

    a.send(2);
    b.send(3);
  });

  it('should pass the error function in `rest` param if automatically creating a signature.', done => {
    let e = expr((a: any, ...[error]:[ErrorCallback]) => {
      a.should.equal(42);
      error('well ...');
    });

    let a = new Source(); a.to(e.in(0));
    e.result.subscribe(() => {}, () => done());
    a.send(42);
  });

  it('should also pass the context in `rest` param if automatically creating a signature.', done => {
    let e = expr((_:any, ...[__, ctx]: [any, ContextType]) => {
      ctx.name.should.equal('the dude');
      done();
    });

    let a = new Source(); a.to(e.in(0));
    e.result.subscribe();
    a.emit(emission('whatever', {name: 'the dude'}));
  });
});
