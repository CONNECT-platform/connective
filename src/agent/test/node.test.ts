import { should } from 'chai'; should();

import { ErrorCallback } from '../../shared/types';

import { Node, NodeInputs, NodeOutput } from '../node';
import { Source } from '../../pin/source';
import { Control } from '../../pin/control';


describe('Node', () => {
  it('should run its `.run()` function with all of its inputs and output the given `output`.', done => {
    class _N extends Node {
      constructor(){
        super({
          inputs: ['a', 'b'],
          outputs: ['c']
        })
      }

      protected run(inputs: NodeInputs, output: NodeOutput) {
        output('c', inputs.a + inputs.b);
      }
    }

    let n = new _N();
    let a = new Source(); let b = new Source();
    a.to(n.in('a')); b.to(n.in('b'));
    n.out('c').observable.subscribe(res => {
      res.should.equal(5);
      done();
    });

    a.send(2); b.send(3);
  });

  it('should not return results in the order of requested execution.', done => {
    class _N extends Node {
      constructor() {
        super({
          inputs: ['delay'],
          outputs: ['delay']
        })
      }

      protected run(inputs: NodeInputs, output: NodeOutput) {
        setTimeout(() => output('delay', inputs.delay), inputs.delay);
      }
    }

    let n = new _N();
    let a = new Source();
    let res : number[] = [];
    a.to(n.in('delay'));
    n.out('delay').observable.subscribe(delay => {
      res.push(delay);
      if (res.length >= 2) {
        res.should.eql([10, 20]);
        done();
      }
    });

    a.send(20);
    a.send(10);
  });

  it('should execute instantly if it has no parameters.', done => {
    class _N extends Node {
      constructor(){super({outputs: ['out']})}
      run(_: NodeInputs, output: NodeOutput) {output('out', 2);}
    }

    let n = new _N();
    n.out('out').observable.subscribe(() => done());
  });

  it('should only wait on inputs that are connected.', done => {
    class _N extends Node {
      constructor(){super({inputs:['a', 'b'], outputs: ['o']})}
      run(_: NodeInputs, out: NodeOutput) {out('o');}
    }

    let n = new _N();
    let a = new Source().to(n.in('a'));
    n.out('o').observable.subscribe(() => done());
    a.send();
  });

  it('should wait for control pin if it is connected.', done => {
    class _N extends Node {
      constructor(){super({outputs: ['out']})}
      run(_: NodeInputs, output: NodeOutput) {output('out');}
    }

    let n = new _N();
    let a = new Source().to(n.control);
    let b = new Source().to(n.control);
    n.out('out').observable.subscribe(() => done());
    a.send();
    b.send();
  });

  it('should wait for control pin at most once.', () => {
    let r = 0;
    class _N extends Node {
      constructor(){super({inputs: ['a', 'b'], outputs: ['o']})}
      run(_: NodeInputs, out:NodeOutput) {r++; out('o');}
    }

    let n = new _N();
    let a = new Source().to(n.in('a'));
    let b = new Source().to(n.in('b'));
    let c = new Source().to(n.control);
    n.out('o').observable.subscribe(() => {});

    a.send(2); b.send(3); r.should.equal(0);
    c.send(); r.should.equal(1);
    a.send(4); r.should.equal(2);
  });

  it('should re-execute each time a control is sent.', () => {
    let r = 0;
    class _N extends Node {
      constructor(){super({outputs: ['o']})}
      run(_: NodeInputs, out:NodeOutput) {r++; out('o');}
    }

    let n = new _N();
    let c = new Source().to(n.control);
    n.out('o').observable.subscribe(() => {});

    c.send(); r.should.equal(1);
    c.send(); r.should.equal(2);
  });

  it('should error if some of the inputs in `signature.required` are not provided.', done => {
    class _N extends Node {
      constructor(){super({inputs: ['a', 'b'], required: ['a'], outputs: ['c']})}
      run(_: NodeInputs, out: NodeOutput) {out('c');}
    }

    let n = new _N();
    let b = new Source().to(n.in('b'));
    n.out('c').observable.subscribe(() => {}, _ => {
      done();
    });

    b.send(42);
  });

  it('should error its outputs when an output out of the signature is invoked.', done => {
    class _N extends Node {
      constructor(){super({outputs: ['out']})}
      run(_: NodeInputs, output: NodeOutput) {output('scout');}
    }

    let a = new _N();
    a.out('out').observable.subscribe(() => {}, () => done());
  });

  it('should channel synchronously thrown errors in `.run()` to error of its outputs.', done => {
    class _N extends Node {
      constructor(){super({outputs: ['out']})}
      run() { throw new Error(); }
    }

    let a = new _N();
    a.out('out').observable.subscribe(() => {}, () => done());
  });

  it('should provide an error function to `.run()` so that it can signal errors through any of its outputs.', done => {
    class _N extends Node {
      constructor(){super({outputs: ['out']})}
      run(_: NodeInputs, __: NodeOutput, error: ErrorCallback) { error(new Error()); }
    }

    let a = new _N();
    a.out('out').observable.subscribe(() => {}, () => done());
  });

  describe('.with()', () => {
    it('should set a context object on the node accessible on all runs via `.context`.', done => {
      class _N extends Node {
        constructor(){super({outputs:['o']})}
        run(_: NodeInputs, out: NodeOutput) { this.context.count++; out('o', this.context.count); }
      }

      let n = new _N().with({count: 0});
      let a = new Source().to(n.control);

      n.out('o').observable.subscribe(val => {
        if (val >= 2) done();
      });

      a.send();
      a.send();
    });
  });

  describe('.control', () => {
    it('should be instance of `Control`.', () => {
      class _N extends Node { constructor(){super({outputs:[]})} run() {}}
      new _N().control.should.be.instanceOf(Control);
    });
  });
});
