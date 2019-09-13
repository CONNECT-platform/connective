import { should } from 'chai'; should();

import emission from '../../shared/emission';
import { ErrorCallback, ContextType } from '../../shared/types';

import { source, Source } from '../../pin/source';
import { Control } from '../../pin/control';
import { group, Group } from '../../pin/group';
import pin from '../../pin/pin';
import sink from '../../pin/sink';
import map from '../../pin/map';

import { node, Node, NodeInputs, NodeOutput } from '../node';


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
    n.out('c').subscribe(res => {
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
        setTimeout(() => {
          output('delay', inputs.delay)
        }, inputs.delay);
      }
    }

    let n = new _N();
    let a = new Source();
    let res : number[] = [];
    a.to(n.in('delay'));
    n.out('delay').subscribe(delay => {
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
    n.out('out').subscribe(() => done());
  });

  it('should only wait on inputs that are connected.', done => {
    class _N extends Node {
      constructor(){super({inputs:['a', 'b'], outputs: ['o']})}
      run(_: NodeInputs, out: NodeOutput) {out('o');}
    }

    let n = new _N();
    let a = new Source(); a.to(n.in('a'));
    n.out('o').subscribe(() => done());
    a.send();
  });

  it('should wait for control pin if it is connected.', done => {
    class _N extends Node {
      constructor(){super({outputs: ['out']})}
      run(_: NodeInputs, output: NodeOutput) {output('out');}
    }

    let n = new _N();
    let a = new Source(); a.to(n.control);
    let b = new Source(); b.to(n.control);
    n.out('out').subscribe(() => done());
    a.send();
    b.send();
  });

  it('should wait for control pin every time.', () => {
    let r = 0;
    class _N extends Node {
      constructor(){super({inputs: ['a', 'b'], outputs: ['o']})}
      run(_: NodeInputs, out:NodeOutput) {r++; out('o');}
    }

    let n = new _N();
    let a = new Source(); a.to(n.in('a'));
    let b = new Source(); b.to(n.in('b'));
    let c = new Source(); c.to(n.control);
    n.out('o').subscribe(() => {});

    a.send(2); b.send(3); r.should.equal(0);
    c.send(); r.should.equal(1);
    a.send(4); r.should.equal(1);
    c.send(); r.should.equal(2);
  });

  it('should re-execute each time a control is sent.', () => {
    let r = 0;
    class _N extends Node {
      constructor(){super({outputs: ['o']})}
      run(_: NodeInputs, out:NodeOutput) {r++; out('o');}
    }

    let n = new _N();
    let c = new Source(); c.to(n.control);
    n.out('o').subscribe(() => {});

    c.send(); r.should.equal(1);
    c.send(); r.should.equal(2);
  });

  it('should error if some of the inputs in `signature.required` are not provided.', done => {
    class _N extends Node {
      constructor(){super({inputs: ['a', 'b'], required: ['a'], outputs: ['c']})}
      run(_: NodeInputs, out: NodeOutput) {out('c');}
    }

    let n = new _N();
    let b = new Source(); b.to(n.in('b'));
    n.out('c').subscribe(() => {}, _ => {
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
    a.out('out').subscribe(() => {}, () => done());
  });

  it('should channel synchronously thrown errors in `.run()` to error of its outputs.', done => {
    class _N extends Node {
      constructor(){super({outputs: ['out']})}
      run() { throw new Error(); }
    }

    let a = new _N();
    a.out('out').subscribe(() => {}, () => done());
  });

  it('should provide an error function to `.run()` so that it can signal errors through any of its outputs.', done => {
    class _N extends Node {
      constructor(){super({outputs: ['out']})}
      run(_: NodeInputs, __: NodeOutput, error: ErrorCallback) { error(new Error()); }
    }

    let a = new _N();
    a.out('out').subscribe(() => {}, () => done());
  });

  it('should provide context to `.run()` as well', done => {
    class _N extends Node {
      constructor(){super({inputs: ['i'], outputs: ['o']})}
      run(_: NodeInputs, __: NodeOutput, ___: ErrorCallback, context: ContextType) {
        context.purpose.should.equal('All work and no play makes jack a dull boy.');
        done();
      }
    }

    let n = new _N();
    let a = new Source(); a.to(n.in('i'));
    n.out('o').subscribe();
    a.emit(emission(42, {purpose: 'All work and no play makes jack a dull boy.'}));
  });

  it('should be shared to avoid multiple invocations of run().', () => {
    let r = 0;
    class _N extends Node {
      constructor(){super({outputs: ['o']})}
      run(_: NodeInputs, __: NodeOutput) {
        r++;
        __('o');
      }
    }

    let n = new _N();
    let a = new Source(); a.to(n.control);
    let [p1, p2] = (n.out('o').to(pin(), pin()) as Group).pins;
    p1.subscribe();
    p2.subscribe();
    a.send();
    r.should.equal(1);
  });

  it('should be serially connectible.', () => {
    class N extends Node {
      constructor(){super({inputs:['a', 'b'], outputs:['zero', 'one', 'two']})}
      run(_: NodeInputs, __: NodeOutput) {
        let k = (_.a + _.b) % 3;
        if (k == 0) __('zero');
        if (k == 1) __('one');
        if (k == 2) __('two');
      }
    }

    let z = false, o = false, t = false;
    let a = source(); let b = source();
    group(a, b).serialTo(new N()).serialTo(
      sink(() => z = true), sink(() => o = true), sink(() => t = true))
      .subscribe();
   
    a.send(1); b.send(1);
    a.send(4); b.send(3);

    z.should.be.false;
    o.should.be.true;
    t.should.be.true;
  });

  describe('.control', () => {
    it('should be instance of `Control`.', () => {
      class _N extends Node { constructor(){super({outputs:[]})} run() {}}
      new _N().control.should.be.instanceOf(Control);
    });
  });
});


describe('node()', () => {
  it('should return a `Node` factory.', () => {
    node({outputs: []}, () => {})().should.be.instanceof(Node);
  });

  it('should return a factory that creates `Nodes` with given signature.', () => {
    let sig = { inputs: ['a', 'b'], outputs: ['c', 'd'] };
    node(sig, () => {})().signature.should.eql(sig);
  });

  it('should return a factory that creates `Nodes` running given run function.', () => {
    let n = node({
      inputs: ['a'],
      outputs: ['odd', 'even']},
    (inputs, output) => {
      if (inputs.a % 2 == 0) output('even');
      else output('odd');
    })();

    let res = <string[]>[];
    let a = new Source();

    a.to(n.in('a'));
    group(
      n.out('odd').to(map(() => 'X')),
      n.out('even').to(map(() => 'Y'))
    ).subscribe(v => res.push(v));

    a.send(2);
    a.send(3);
    a.send(4);
    a.send(5);
    a.send(6);

    res.should.eql(['Y', 'X', 'Y', 'X', 'Y']);
  });
});
