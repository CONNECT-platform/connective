import { should, expect } from 'chai'; should();

import pin from '../../pin/pin';
import control from '../../pin/control';
import value from '../../pin/value';
import map from '../../pin/map';
import source from '../../pin/source';
import sink from '../../pin/sink';

import { Composition } from '../composition';
import expr from '../expr';
import state from '../state';


describe.only('Composition', () => {
  it('should invoke its `.build()` and `.wire()` functions in order.', () => {
    let res: string[] = [];
    class C extends Composition {
      build() { res.push('build'); }
      wire() { res.push('wire'); }
    }

    new C({outputs: []});
    res.should.eql(['build', 'wire']);
  });

  describe('.init()', () => {
    it('should be overridable, allowing child classes to modify init process.', () => {
      let res: string[] = [];
      class C extends Composition {
        build() { res.push('build'); }
        wire() { res.push('wire'); }
        init() { this.wire(); }
      }

      new C({outputs: []});
      res.should.eql(['wire']);
    });
  });

  describe('.add()', () => {
    it('should add child agents with given names, fetchable via `.child()`', done => {
      let e = expr((x: number) => x * 2);
      class C extends Composition {
        build() { this.add('e', e); }
        wire() {
          this.child('e').should.equal(e);
          done();
        }
      }

      new C({outputs: []});
    });

    it('should add child pins with given names, fetchable via `.child()`', done => {
      let p = pin();
      class C extends Composition {
        build() { this.add('p', p); }
        wire() {
          this.child('p').should.equal(p);
          done();
        }
      }

      new C({outputs: []});
    });

    it('should add unnamed children anonymously, fetchable via `.child(<index>)`', done => {
      let p = pin();
      let e = expr((x: number) => x * 2);

      class C extends Composition {
        build() { this.add(p); this.add('p', pin()), this.add(e); }
        wire() {
          this.child(0).should.equal(p);
          this.child(2).should.equal(e);
          done();
        }
      }

      new C({outputs: []});
    });

    it('should return the newly added child.', done => {
      let e = expr((x: number) => x * 2);
      class C extends Composition {
        build() { this.add(e).should.equal(e); }
        wire() { done(); }
      }

      new C({outputs: []});
    });
  });

  describe('.child()', () => {
    it('should throw an error if child is not defined.', () => {
      class C extends Composition {
        build() {}
        wire() { this.child('x'); }
      }

      expect(() => new C({outputs: []})).to.throw();
    });
  });

  describe('.pin()', () => {
    it('should return a pin child.', done => {
      class C extends Composition {
        constructor() { super({outputs: ['42']})}
        build() { this.add(value(42)); }
        wire() { this.pin(0).to(this.out('42')); }
      }

      new C().out('42').observable.subscribe(v => {
        v.should.equal(42);
        done();
      });
    });

    it('should throw a proper error if child is not a pin.', () => {
      class C extends Composition {
        constructor() { super({outputs: []}); }
        build() { this.add(expr(() => {})); }
        wire() { this.pin(0); }
      }

      expect(() => new C()).to.throw();
    });
  });

  describe('.agent()', () => {
    it('should return an agent child.', done => {
      class C extends Composition {
        constructor() { super({outputs: ['42']})}
        build() { this.add(expr(() => 42)); }
        wire() { this.agent(0).out('result').to(this.out('42')); }
      }

      new C().out('42').observable.subscribe(v => {
        v.should.equal(42);
        done();
      });
    });

    it('should throw a proper error if child is not an agent.', () => {
      class C extends Composition {
        constructor() { super({outputs: []}); }
        build() { this.add(pin()); }
        wire() { this.agent(0); }
      }

      expect(() => new C()).to.throw();
    });
  });

  describe('.bind()', () => {
    it('should bind all state children.', done => {
      class C extends Composition {
        constructor() { super({inputs: ['i'], outputs: ['o']})}
        build() {
          this.add(state());
        }
        wire() {
          this.in('i').to(this.agent(0).in('value'));
          this.out('o').from(this.agent(0).out('value'));
        }
      }

      let c = new C();
      let s = source().to(c.in('i'));
      c.bind();
      s.send(42);
      c.out('o').observable.subscribe(v => {
        v.should.equal(42);
        done();
      });
    });

    it('should bind all of its child sinks.', done => {
      class C extends Composition {
        constructor() { super({outputs: []})}
        build() { this.add(control()); this.add(sink(() => done())); }
        wire() { this.pin(0).to(this.pin(1)); }
      }

      new C().bind();
    });

    it('should bind its child compositions.', done => {
      class C1 extends Composition {
        constructor() { super({outputs: []})}
        build() { this.add(control()); this.add(sink(() => done())); }
        wire() { this.pin(0).to(this.pin(1)); }
      }

      class C2 extends Composition {
        constructor() { super({outputs: []})}
        build() { this.add(new C1()); }
        wire() {}
      }

      new C2().bind();
    });
  });

  describe('.toBind()', () => {
    it('should bind the given `Bindable` when `.bind()` is invoked.', done => {
      class C extends Composition {
        constructor() { super({outputs: []})}
        build() { this.toBind({ bind: () => { done(); return this; } })}
        wire() {}
      }

      new C().bind();
    });
  });

  describe('.clear()', () => {
    it('should clear out the composition.', () => {
      class C extends Composition {
        constructor() { super({inputs: ['i'], outputs: ['o']})}
        build() { this.add(map((x: number) => x * 2)); }
        wire() {  this.in('i').to(this.pin(0).to(this.out('o'))); }
      }

      let res = 0;
      let c = new C();
      let a = source().to(c.in('i'));
      let sub = c.out('o').observable.subscribe(x => res += x);

      a.send(1);
      res.should.equal(2);

      sub.unsubscribe();
      sub = c.out('o').observable.subscribe(x => res += x);
      a.send(1);
      res.should.equal(4);

      sub.unsubscribe(); c.clear();
      sub = c.out('o').observable.subscribe(x => res += x);
      a.send(1);
      res.should.equal(4);
    });
  });
});
