import { should } from 'chai'; should();

import { Source } from '../../pin/source';

import { Proxy } from '../proxy';
import expr from '../expr';


describe('Proxy', () => {
  it('should proxy a given signature in the graph that can be later linked to actual agents.', () => {
    let res = <number[]>[];
    let p = new Proxy({inputs: ['a'], outputs: ['result']});
    let a = new Source(); a.to(p.in('a'));
    let e = expr((x: number) => x * 2);
    p.out('result').to(e.in(0));
    e.result.subscribe((x: number) => res.push(x));

    a.send(1);
    res.should.eql([]);

    p.proxy(expr(['a'], (a: number) => a + 1));
    a.send(1);
    res.should.include(4);
  });

  it('should be able to proxy multiple agents, channeling all their outputs to the proxied output.', () => {
    let res = <number[]>[];
    let p = new Proxy({inputs: ['a'], outputs: ['result']});
    let a = new Source(); a.to(p.in('a'));
    let e = expr((x: number) => x * 3);
    p.out('result').to(e.in(0));
    e.result.subscribe((x: number) => res.push(x));

    p.proxy(expr(['a'], (a: number) => a + 1));
    p.proxy(expr(['a'], (a: number) => a + 2));
    a.send(1);

    res.should.have.members([6, 9]);
    res.length.should.equal(2);
  });

  it('should remove a proxied agent via unsubscribing the `Subscription` returned by `.proxy()`', () => {
    let res = <number[]>[];
    let p = new Proxy({inputs: ['a'], outputs: ['result']});
    let a = new Source(); a.to(p.in('a'));
    let e = expr((x: number) => x * 5);
    p.out('result').to(e.in(0));
    e.result.subscribe((x: number) => res.push(x));

    p.proxy(expr(['a'], (a: number) => a + 1));
    let sub = p.proxy(expr(['a'], (a: number) => a + 2));
    a.send(1);
    sub.unsubscribe();
    a.send(3);

    res.should.have.members([10, 15, 20]);
    res.length.should.equal(3);
  });
});
