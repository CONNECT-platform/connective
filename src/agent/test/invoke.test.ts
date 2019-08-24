import { should } from 'chai'; should();

import source from '../../pin/source';

import { Composition } from '../composition';
import expr from '../expr';
import invoke, { Invoke } from '../invoke';


describe('Invoke', () => {
  it('should call the given agent factory for each set of completed inputs.', () => {
    let res = 0;
    let i = invoke(() => { res++; return expr((_: any, __: any) => 0) });

    let a = source(); a.to(i.in(0));
    let b = source(); b.to(i.in(1));
    i.out('result').subscribe();

    a.send(2); b.send(10);
    a.send(3); b.send(20);

    res.should.be.at.least(2);
  });

  it('should pass the proper paremeters to created agent.', () => {
    let res = <any[]>[];
    let i = invoke(() => expr((a: any, b: any) => {
      res.push([a, b]);
      return a + b;
    }));

    let a = source(); a.to(i.in(0));
    let b = source(); b.to(i.in(1));
    i.out('result').subscribe();

    a.send(2); b.send(10);
    a.send(3); b.send(20);

    res[0].should.eql([2, 10]);
    res[1].should.eql([3, 20]);
  });

  it('should wait for  `.control` each time, if connected.', () => {
    let res = <number[]>[];
    let i = invoke(() => expr((_: any) => _ * 2));
    let a = source(); a.to(i.in(0));
    let c = source(); c.to(i.control);
    i.out('result').subscribe(v => res.push(v));

    a.send(2); res.should.eql([]);
    c.send(); res.should.eql([4]);

    a.send(3); res.should.eql([4]);
    c.send(); res.should.eql([4, 6]);
  });

    it('should re-execute with latest inputs when `.control` emits.', () => {
      let res = <number[]>[];
      let i = invoke(() => expr((_: any) => _ * 2));
      let a = source(); a.to(i.in(0));
      let c = source(); c.to(i.control);
      i.out('result').subscribe(v => res.push(v));

      a.send(2); c.send();
      res.should.eql([4]);

      c.send(); res.should.eql([4, 4]);
    });

  it('should have the same signature as given signature.', () => {
    let sig = {inputs: ['a', 'b'], outputs: ['c', 'd']};
    invoke(() => expr(() => {}), sig).signature.should.eql(sig);
  });

  it('should have the same signature as the result of provided factory if no signature is provided.', () => {
    let sig = {inputs: ['a', 'b'], outputs: ['c', 'd']};
    class C extends Composition {
      constructor() { super(sig); }
      build() {}
      wire() {}
    }

    invoke(() => new C()).signature.should.eql(sig);
  });

  it('should work properly with agents without inputs.', done => {
    invoke(() => expr(() => 'hellow')).out('result').subscribe(v => {
      v.should.equal('hellow');
      done();
    });
  });

  it('should re-execute when no inputs are given when `.control` emits.', () => {
    let res = <string[]>[];
    let i = invoke(() => expr(() => 'hellow'));
    let c = source(); c.to(i.control);

    i.out('result').subscribe(v => res.push(v));
    c.send(); c.send();
    res.should.eql(['hellow', 'hellow']);
  });

  it('should clear out the created agents when the result is given.', done => {
    let count = 0;

    class C extends Composition {
      constructor() { super({inputs: ['i'], outputs: ['o']})}
      build() {}
      wire() { this.in('i').to(this.out('o')); }
      clear() { count++; if (count >= 2) done(); return super.clear(); }
    }

    let i = invoke(() => new C());
    let a = source(); a.to(i.in('i'));
    i.out('o').subscribe();

    a.send(2);
  });
});

describe('invoke()', () => {
  it('should return an `Invoke` instance.', () => {
    invoke(() => expr(() => {})).should.be.instanceof(Invoke);
  });
});
