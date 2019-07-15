import { should } from 'chai'; should();

import call from '../call';
import expr from '../expr';


describe('call()', () => {
  it('should create an agent using given factory and pass it given data.', done => {
    call(() => expr((a: any, b: any) => a + b), {0: 2, 1: 3})
    .subscribe(v => {
      v.should.eql({label: 'result', value: 5});
      done();
    });
  });
});
