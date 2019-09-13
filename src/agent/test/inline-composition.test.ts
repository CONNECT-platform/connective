import { should } from 'chai'; should();

import pin from '../../pin/pin';
import map from '../../pin/map';
import sink from '../../pin/sink';
import source from '../../pin/source';

import { composition } from '../inline-composition';

describe('composition()', () => {
  it('should create compositions based on given factory function.', done => {
    let C = composition(() => {
      let input = pin();
      let output = input.to(map((x: any) => x * 2));
      return [[input], [output]];
    });

    let a = source();
    a.to(C()).subscribe(v => {
      v.should.equal(4);
      done();
    });

    a.send(2);
  });

  it('should deduce the signature from returned pins.', () => {
    let C = composition(() => {
      let input = pin();
      let output = input.to(map((x: any) => x * 2));
      return [{input}, {output}];
    });

    let c = C();
    c.signature.should.eql({ inputs: ['input'], outputs: ['output'] });
  });

  it('should provide the factory with a function that will add given agents to the children of the composition.',
  done => {
    let C = composition(track => {
      let i = pin();
      track(i.to(sink(() => done())));
      return [[i], [pin()]];
    });

    let a = source();
    let c = C();

    a.to(c);
    c.bind();

    a.send();
  })
});