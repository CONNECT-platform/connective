import { should } from 'chai'; should();

import source from '../../pin/source';

import expr from '../expr';
import { NodeWrap } from '../node-wrap';
import { Composition } from '../composition';


describe('NodeWrap', () => {
  it('should wait for all connected inputs before feeding them to wrapped agent.', done => {
    class C extends Composition {
      constructor() { super({inputs: ['a', 'b'], outputs: ['o']})}
      build() {
        this.add(expr((a: number, b: number) => a + b));
      }
      wire() {
        this.in('a').to(this.agent(0).in(0));
        this.in('b').to(this.agent(0).in(1));
        this.out('o').from(this.agent(0).out('result'));
      }
    }

    let c = new NodeWrap(new C());
    let a = source(); a.to(c.in('a'));
    let b = source(); b.to(c.in('b'));
    c.out('o').subscribe(val => {
      val.should.equal(5);
      done();
    });

    a.send(2);
    b.send(3);
  });

  it('should only wait for connected inputs before feeding them to wrapped agent.', done => {
    class C extends Composition {
      constructor() { super({inputs: ['a', 'b'], outputs: ['o']})}
      build() {
        this.add(expr((_: number, b: number) => {
          if (b) return 'two';
          else return 'one';
        }));
      }
      wire() {
        this.in('a').to(this.agent(0).in(0));
        this.in('b').to(this.agent(0).in(1));
        this.out('o').from(this.agent(0).out('result'));
      }
    }

    let c = new NodeWrap(new C());
    let a = source(); a.to(c.in('a'));
    c.out('o').subscribe(val => {
      val.should.equal('one');
      done();
    });

    a.send(2);
  });

  it('should wait for its control before feeding inputs to wrapped agent.', () => {
    class C extends Composition {
      constructor() { super({inputs: ['i'], outputs: ['o']}) }
      build() {}
      wire() { this.in('i').to(this.out('o')); }
    }

    let c = new NodeWrap(new C());
    let res: number[] = [];

    let a = source(); a.to(c.in('i'));
    let b = source(); b.to(c.control);

    c.out('o').subscribe(val => res.push(val));

    a.send(2);
    res.should.eql([]);
    b.send();
    res.should.eql([2]);
  });

  it('should wait for its control only once.', () => {
    class C extends Composition {
      constructor() { super({inputs: ['i'], outputs: ['o']}) }
      build() {}
      wire() { this.in('i').to(this.out('o')); }
    }

    let c = new NodeWrap(new C());
    let res: number[] = [];

    let a = source(); a.to(c.in('i'));
    let b = source(); b.to(c.control);

    c.out('o').subscribe(val => res.push(val));

    a.send(2);
    b.send();
    res.should.eql([2]);

    a.send(3);
    res.should.eql([2, 3]);
  });

  it('should re-execute upon control signal.', () => {
    class C extends Composition {
      constructor() { super({inputs: ['i'], outputs: ['o']}) }
      build() {}
      wire() { this.in('i').to(this.out('o')); }
    }

    let c = new NodeWrap(new C());
    let res: number[] = [];

    let a = source(); a.to(c.in('i'));
    let b = source(); b.to(c.control);

    c.out('o').subscribe(val => res.push(val));

    a.send(2);
    b.send();
    b.send();
    res.should.eql([2, 2]);
  });
});
