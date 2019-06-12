import { should } from 'chai'; should();

import { State } from '../state';
import { Source } from '../../pin/source';
import { Pin } from '../../pin/pin';


describe.only('State', () => {
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
})
