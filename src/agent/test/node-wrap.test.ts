import { should } from 'chai'; should();

import source from '../../pin/source';
import map from '../../pin/map';
import filter from '../../pin/filter';

import { NodeWrap } from '../node-wrap';
import { Composition } from '../composition';


describe('NodeWrap', () => {
  it('should make an agent behave like a node', done => {
    class C extends Composition {
      constructor() { super({inputs: ['i'], outputs: ['o']})}
      build() {
        this.add(filter((val: any) => val == 5));
        this.add(filter((val: any) => val != 5));

        this.add(map((val: any, callback: any) => {
          setTimeout(() => callback(val), 1);
        }));
      }
      wire() {
        this.in('i').to(
          this.pin(0),
          this.pin(1).to(this.pin(2)));
        this.out('o').from(this.pin(0), this.pin(2));
      }
    }

    let res: number[] = [];
    let c = new NodeWrap(new C());
    let a = source().to(c.in('i'));

    c.out('o').observable.subscribe(v => {
      res.push(v);
      if (res.length >= 2) {
        res.should.eql([10, 5]);
        done();
      }
    });

    a.send(10);
    a.send(5);
  });
});
