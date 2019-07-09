import { should } from 'chai'; should();

import { of } from 'rxjs';

import emission from '../../shared/emission';

import sink, { Sink } from '../sink';
import wrap from '../wrap';
import { Source } from '../source';
import { Pin } from '../pin';


describe('sink()', () => {
  it('should be a lock the connected graph before it when its `.bind()` is called.', () => {
    let s = sink();
    let a = new Pin();
    a.to(new Pin(), new Pin()).to(s);
    s.bind();
    a.locked.should.be.true;
  });

  it('should invoke the given sink func upon `.bind()`', done => {
    (
      wrap(of(42))
      .to(sink((val: any) => {
        val.should.equal(42);
        done();
      })) as Sink
    ).bind();
  });

  it('should not invoke the function after `.clear()`', () => {
    let c = 0;
    let a = new Source();
    let s1 = sink(() => c++);
    let s2 = sink(() => c++);
    a.to(s1, s2);

    a.send();
    c.should.equal(0);

    s1.bind();
    a.send();
    c.should.equal(1);

    s2.bind();
    a.send();
    c.should.equal(3);

    s1.clear();
    a.send();
    c.should.equal(4);
  });

  it('should also call the function when `.bind()` is not called but the pin chain is actualized.', done => {
    let p = new Pin();
    let a = new Source();
    a.to(sink(() => done())).to(p);

    p.subscribe();
    a.send(42);
  });

  it('should provide the sink func with context.', done => {
    let a = new Source();
    a.to(sink((_, ctx) => {
      ctx.x.should.equal(42);
      done();
    })).subscribe();

    a.emit(emission(2, {x: 42}));
  });
});
