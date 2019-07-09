import { should, expect } from 'chai'; should();

import { State } from '../state';
import { Source } from '../../pin/source';
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
})
