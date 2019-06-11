import { should, expect } from 'chai'; should();

import { Agent } from '../agent';


describe('Agent', () => {
  it('should load.', () => {});

  describe('.input()', () => {
    it('should return an input that will send the data sent to `receive()` to its observable.', done => {
      let a = new Agent();

      let i = a.input('hellow');
      i.observable.subscribe(data => {
        data.should.equal('world');
        done();
      });

      i.receive('world');
    });

    it('should return an input that whose observable only picks up data sent to its tag.', done => {
      let a = new Agent();

      a.input('a').observable.subscribe(() => { throw new Error('should not have happened!'); });
      a.input('b').observable.subscribe(() => done());

      a.input('b').receive('yo');
    });

    it('should return an input that can be connected to outputs.', done => {
      let a = new Agent();
      let b = new Agent();

      a.input('x').connect(b.output('y'));
      a.input('x').observable.subscribe(data => {
        data.should.equal('hey');
        done();
      });

      b.output('y').send('hey');
    });
  });

  describe('.output()', () => {
    it('should return an output that will send the data sent to `send()` to its observable.', done => {
      let a = new Agent();

      let o = a.output('hellow');
      o.observable.subscribe(data => {
        data.should.equal('world');
        done();
      });

      o.send('world');
    });

    it('should return an output that whose observable only picks up data sent to its tag.', done => {
      let a = new Agent();

      a.output('a').observable.subscribe(() => { throw new Error('should not have happened!'); });
      a.output('b').observable.subscribe(() => done());

      a.output('b').send('yo');
    });

    it('should return an output that can be connected to inputs.', done => {
      let a = new Agent();
      let b = new Agent();

      a.output('x').connect(b.input('y'));
      b.input('y').observable.subscribe(data => {
        data.should.equal('fellas');
        done();
      });

      a.output('x').send('fellas');
    });
  });
});
