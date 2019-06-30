import { should } from 'chai'; should();

import source from '../../pin/source';

import { Gate } from '../gate';


describe('Gate', () => {
  it('should only pass values that receive a `true` signal.', () => {
    let res: number[] = [];
    let g = new Gate();
    let a = source().to(g.input);
    let c = source().to(g.control);

    g.output.subscribe(v => res.push(v));

    a.send(42); c.send(true);
    a.send(24); c.send(false);
    a.send(13); c.send(true);

    res.should.eql([42, 13]);
  });

  it('should match signals and values.', () => {
    let res: number[] = [];
    let g = new Gate();
    let a = source().to(g.input);
    let c = source().to(g.control);

    g.output.subscribe(v => res.push(v));

    c.send(true); a.send(42);
    c.send(false); c.send(true);
    a.send(24); a.send(13);

    res.should.eql([42, 13]);
  });

  it('should wait for a boolean signal for each value.', () => {
    let res: number[] = [];
    let g = new Gate();
    let a = source().to(g.input);
    let c = source().to(g.control);

    g.output.subscribe(v => res.push(v));

    a.send(42); a.send(24); a.send(13);
    res.should.eql([]);

    c.send(true); res.should.eql([42]);
    c.send(false); res.should.eql([42]);
    c.send(true); res.should.eql([42, 13]);
  });

  it('should wait for all connections to its control and only allow those who receive `true` by all.', () => {
    let res: number[] = [];
    let g = new Gate();
    let a = source().to(g.input);
    let c1 = source().to(g.control);
    let c2 = source().to(g.control);

    g.output.subscribe(v => res.push(v));

    a.send(42); a.send(24); a.send(13);

    c1.send(true); res.should.eql([]);
    c2.send(true); res.should.eql([42]);

    c1.send(true); c2.send(false);
    res.should.eql([42]);

    c1.send(true); res.should.eql([42]);
    c2.send(true); res.should.eql([42, 13]);
  });
});
