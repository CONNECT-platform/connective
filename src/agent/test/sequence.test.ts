import { should } from 'chai'; should();

import source from '../../pin/source';

import seq, { Sequence } from '../sequence';


describe('Sequence', () => {
  it('should fill up a sequence of values based on given number from each source.', done => {
    let s = seq(1, 2, 1);
    let a = source(); a.to(s.in(0));
    let b = source(); b.to(s.in(1));
    let c = source(); c.to(s.in(2));
    s.output.subscribe(val => {
      val.should.eql(['b', ['b', 'b'], 'b']);
      done();
    });


    a.send('a'); b.send('a'); c.send('a'); // No result
    a.send('b'); b.send('b'); b.send('b'); c.send('b'); // Result
  });

  it('should ensure the order of incoming values from each source.', done => {
    let s = seq(1, 2, 1);
    let a = source(); a.to(s.in(0));
    let b = source(); b.to(s.in(1));
    let c = source(); c.to(s.in(2));
    s.output.subscribe(val => {
      val.should.eql(['b', ['b', 'b'], 'b']);
      done();
    });


    a.send('a'); b.send('a'); c.send('a'); b.send('a'); // No result
    a.send('b'); b.send('b'); b.send('b'); c.send('b'); // Result
  });

  it('should work properly with 0 items.', done => {
    let s = seq(1, 0, 1);
    let a = source(); a.to(s.in(0));
    let b = source(); b.to(s.in(1));
    let c = source(); c.to(s.in(2));

    s.output.subscribe(() => done());

    a.send(); b.send(); c.send(); // No result
    a.send(); c.send(); // Result
  });

  it('should properly handle leading 0s.', done => {
    let s = seq(0, 0, 2);
    let a = source(); a.to(s.in(0));
    let b = source(); b.to(s.in(1));
    let c = source(); c.to(s.in(2));

    s.output.subscribe(val => {
      val.should.eql([[], [], ['c', 'c']]);
      done();
    });

    a.send('a'); b.send('b'); c.send('c'); // No Result
    a.send('a'); c.send('c'); // No Result
    b.send('b'); c.send('c'); c.send('c'); // Result
  });

  it('should properly handle trailing 0s.', done => {
    let s = seq(1, 2, 0);
    let a = source(); a.to(s.in(0));
    let b = source(); b.to(s.in(1));
    let c = source(); c.to(s.in(2));

    s.output.subscribe(() => done());

    a.send(); b.send(); c.send(); // No Result
    a.send(); b.send(); b.send(); // Result
  });

  it('should properly treat \'+\' as "one or more"', () => {
    let res = <number[]>[];
    let s = seq(1, '+', 1);
    let a = source(); a.to(s.in(0));
    let b = source(); b.to(s.in(1));
    let c = source(); c.to(s.in(2));

    s.output.subscribe(v => res.push(v));

    a.send(1); b.send(1); c.send(1); // Ok
    a.send(2); c.send(2); // Not Ok
    a.send(3); b.send(3); b.send(3); b.send(3); c.send(3); // Ok

    res[0].should.eql([1, 1, 1]);
    res[1].should.eql([3, [3, 3, 3], 3]);
  });

  it('should properly treat \'*\' as "zero or more".', () => {
    let res = <number[]>[];
    let s = seq(1, '*', 2);
    let a = source(); a.to(s.in(0));
    let b = source(); b.to(s.in(1));
    let c = source(); c.to(s.in(2));

    s.output.subscribe(v => res.push(v));

    a.send(1); c.send(1); b.send(1); // Not Ok
    a.send(2); c.send(2); c.send(2); // Ok
    a.send(3); b.send(3); b.send(3); c.send(3); c.send(3); //Ok

    res[0].should.eql([2, [], [2, 2]]);
    res[1].should.eql([3, [3, 3], [3, 3]]);
  });

  it('should properly handle leading *s.', () => {
    let res = <number[]>[];
    let s = seq('*', '*', 2);
    let a = source(); a.to(s.in(0));
    let b = source(); b.to(s.in(1));
    let c = source(); c.to(s.in(2));

    s.output.subscribe(v => res.push(v));

    a.send(1); c.send(1); c.send(1); // Ok
    b.send(2); a.send(2); c.send(2); // Not Ok
    b.send(3); b.send(3); c.send(3); c.send(3); // Ok


    res[0].should.eql([1, [], [1, 1]]);
    res[1].should.eql([[], [3, 3], [3, 3]]);
  });

  it('should properly handle trailing *s.', () => {
    let res = <number[]>[];
    let s = seq(2, '*', '*');
    let a = source(); a.to(s.in(0));
    let b = source(); b.to(s.in(1));
    let c = source(); c.to(s.in(2));

    s.output.subscribe(v => res.push(v));

    a.send(1); c.send(1); c.send(1); // Not Ok
    a.send(2); a.send(2); //Ok
    b.send(2); c.send(2);  //OK, added to prev value
    b.send(2); // Not Ok
    a.send(3); a.send(3); c.send(3); //Ok

    res[0].should.eql([[2, 2], [], []]);
    res[1].should.eql([[2, 2], 2, []]);
    res[2].should.eql([[2, 2], 2, 2]);
    res[3].should.eql([[3, 3], [], []]);
    res[4].should.eql([[3, 3], [], 3]);
  });

  it('should properly treat \'+\' as "one or more".', () => {
    let r = 0;
    let s = seq(1, '+', 2);
    let a = source(); a.to(s.in(0));
    let b = source(); b.to(s.in(1));
    let c = source(); c.to(s.in(2));

    s.output.subscribe(() => r++);

    a.send(); b.send(); b.send(); c.send(); c.send(); // Ok
    a.send(); c.send(); c.send(); // Not Ok
    a.send(); b.send(); c.send(); c.send(); // Ok

    r.should.equal(2);
  });

  describe('.control', () => {
    it('should reset the sequence on signal.', () => {
      let r = 0;
      let s = seq(1, '+');
      let a = source(); a.to(s.in(0));
      let b = source(); b.to(s.in(1));
      let c = source(); c.to(s.control);

      s.output.subscribe(() => r++);

      a.send(1); b.send(1); b.send(1); c.send();
      b.send(1); // Ignored, Not Ok
      a.send(1); b.send(1);

      r.should.equal(3);
    });
  });
});

describe('.sequence()', () => {
  it('should give out a sequence based on given sequence tokens.', () => {
    let s = seq(1, 2, '+', '*');
    s.should.be.instanceof(Sequence);
    s.tokens.length.should.equal(4);
  });
});
