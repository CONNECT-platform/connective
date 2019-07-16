import { should } from 'chai'; should();

import singleton from '../singleton';
import { Composition } from '../composition';


describe('singleton()', () => {
  it('should create an instance of given agent class.', done => {
    @singleton()
    class C extends Composition {
      constructor() { super({outputs: []})}
      build(){}
      wire(){
        done();
      }
    }

    C;
  });

  it('should invoke the `.bind()` function if it exists.', done => {
    @singleton()
    class C extends Composition {
      constructor() { super({outputs: []})}
      build(){}
      wire(){}
      bind() { done(); return super.bind(); }
    }

    C;
  });

  it('should put the instance in `.instance` static member.', () => {
    @singleton()
    class C extends Composition {
      constructor() { super({outputs: []})}
      build(){}
      wire(){}
    }

    (C as any).instance.should.be.instanceof(Composition);
  });
});
