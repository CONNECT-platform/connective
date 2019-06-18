import { should, expect } from 'chai'; should();

import { State } from '../state';
import { Source } from '../../pin/source';
import { Pin } from '../../pin/pin';


describe('State', () => {
  it('should send out data it receives.', done => {
    let a = new Source();
    let s = new State();
    s.input.from(a);
    s.output.observable.subscribe(data => {
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
    s.output.observable.subscribe(() => calls++);

    a.send(42); a.send(42);
    calls.should.equal(1);

    a.send({x: 2}); a.send({x: 2});
    calls.should.equal(2);
  });

  it('should send its data to subscribers even if they subscribe late.', done => {
    let a = new Source();
    let s = new State();

    s.input.from(a);
    s.output.observable.subscribe(() => {});

    a.send(42);

    s.output.observable.subscribe(data => {
      data.should.equal(42);
      done();
    });
  });

  it('should send its data to pins even if they connect late.', done => {
    let a = new Source();
    let s = new State();

    a.to(s.input);
    s.output.observable.subscribe(() => {});

    a.send('hellow');

    new Pin().from(s.output).observable.subscribe(data => {
      data.should.equal('hellow');
      done();
    });
  });

  it('should be possible to bind two states together.', () => {
    let a = new Source(); let b = new Source();
    let s1 = new State(); let s2 = new State();

    a.to(s1.input.from(s2.output));
    b.to(s2.input.from(s1.output));

    let _s1; let _s2;
    new Pin().from(s1.output).observable.subscribe(val => _s1 = val);
    new Pin().from(s2.output).observable.subscribe(val => _s2 = val);

    a.send('hellow'); expect(_s1).to.equal('hellow'); expect(_s2).to.equal('hellow');
    b.send(42); expect(_s1).to.equal(42); expect(_s2).to.equal(42)
  });

  describe('.bind()', () => {
    it('should cause the state start storing values.', done => {
      let s = new State();
      let a = new Source().to(s.input);

      s.bind();
      a.send(42);
      s.output.observable.subscribe(data => {
        data.should.equal(42);
        done();
      });
    });
  });
})
