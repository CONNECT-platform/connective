import { should, expect } from 'chai'; should();

import state, { State } from '../state';
import source, { Source } from '../../pin/source';
import { Pin } from '../../pin/pin';


describe('State', () => {
  it('should send out data it receives.', done => {
    let a = new Source();
    let s = new State();
    s.input.from(a);
    s.output.subscribe(data => {
      data.should.equal(42);
      done();
    });

    a.send(42);
  });

  it('should send out data if it differs from the last thing it received.', () => {
    let a = new Source();
    let s = new State();
    let calls = 0;

    s.input.from(a);
    s.output.subscribe(() => calls++);

    a.send(42); a.send(42);
    calls.should.equal(1);

    a.send({x: 2}); a.send({x: 2});
    calls.should.equal(2);
  });

  it('should send its data to subscribers even if they subscribe late.', done => {
    let a = new Source();
    let s = new State();

    s.input.from(a);
    s.output.subscribe(() => {});

    a.send(42);

    s.output.subscribe(data => {
      data.should.equal(42);
      done();
    });
  });

  it('should send its data to pins even if they connect late.', done => {
    let a = new Source();
    let s = new State();

    a.to(s.input);
    s.output.subscribe(() => {});

    a.send('hellow');

    new Pin().from(s.output).subscribe(data => {
      data.should.equal('hellow');
      done();
    });
  });

  it('should be possible to bind two states together.', () => {
    let a = new Source(); let b = new Source();
    let s1 = new State(); let s2 = new State();

    a.to(s2.output.to(s1.input));
    b.to(s1.output.to(s2.input));

    let _s1; let _s2;
    s1.output.to(new Pin()).subscribe(val => _s1 = val);
    s2.output.to(new Pin()).subscribe(val => _s2 = val);

    a.send('hellow'); expect(_s1).to.equal('hellow'); expect(_s2).to.equal('hellow');
    b.send(42); expect(_s1).to.equal(42); expect(_s2).to.equal(42)
  });

  it('should be efficient in syncing up bounded states.', () => {
    let src = source();
    let s1 = state(42); let s1c = 0;
    let s2 = state(); let s2c = 0;

    src.to(s1).to(s2).to(s1);

    s1.bind();
    s2.bind();

    s1.subscribe(() => s1c++);
    s2.subscribe(() => s2c++);

    s1c.should.equal(1); // one for initial value
    s2c.should.equal(1);

    src.send(43);
    s1c.should.equal(2); // one for changing to 43
    s2c.should.equal(2);

    s2.value = 44;
    s1c.should.equal(3); // one for changing to 44
    s2c.should.equal(3);
  });

  it('should be possible to provide initial values.', () => {
    let a = new Source();
    let s = new State(42);

    let r1 = <number[]>[]; let r2 = <number[]>[];

    a.to(s.input);
    s.output.subscribe(v => r1.push(v));

    a.send(21);
    s.output.subscribe(v => r2.push(v));

    r1.should.eql([42, 21]);
    r2.should.eql([21]);
  });

  it('should share its subscriptions.', () => {
    let s = new State();
    let a = new Source(); a.to(s);
    let b = new Source(); b.to(s);
    let r = 0;
    s.subscribe(() => r++);
    s.subscribe();
    a.send(3);
    r.should.equal(1);
  });

  describe('.input', () => {
    it('should be equal to `.in("value")`', () => {
      let s = new State();
      s.input.should.equal(s.in('value'));
    });
  });

  describe('.output', () => {
    it('should be equal to `.out("value")`', () => {
      let s = new State();
      s.output.should.equal(s.out('value'));
    });
  });

  describe('.bind()', () => {
    it('should cause the state start storing values.', done => {
      let s = new State();
      let a = new Source(); a.to(s.input);

      s.bind();
      a.send(42);
      s.output.subscribe(data => {
        data.should.equal(42);
        done();
      });
    });
  });

  describe('.value', () => {
    it('should be the latest value of the state.', () => {
      let a = new Source();
      let s = new State(42);
      a.to(s).subscribe();

      s.value.should.equal(42);
      a.send(43);
      s.value.should.equal(43);
    });

    it('should be writable.', () => {
      let s = new State();
      s.bind();
      s.value = 42;
      s.value.should.equal(42);
    });

    it('should cause the state to emit new values.', done => {
      let s = new State();
      
      s.subscribe(v => {
        v.should.equal(42);
        done();
      });

      s.value = 42;
    });

    it('should not cause the state to re-emit when value does not truly change', () => {
      let s = new State();
      let r = 0;
      s.subscribe(() => r++);

      s.value = { x : 46 };
      s.value = { x : 46 };
      s.value = { x: 46, y : 2 };
      r.should.equal(2);
    });
  });
})
