import { should } from 'chai'; should();

import { Source } from '../../pin/source';
import { Switch } from '../switch';


describe.only('Switch', () => {
  it('should activate output based on which given `case` matched the given `value`.', () => {
    let a = new Source();
    let s = new Switch([1, 'hellow', false]);

    s.target.from(a);

    let res = '';
    s.case(0).observable.subscribe(() => res = 'A');
    s.case(1).observable.subscribe(() => res = 'B');
    s.case(2).observable.subscribe(() => res = 'C');

    a.send('hellow');
    res.should.equal('B');

    a.send(false);
    res.should.equal('C');
  });

  it('should check with `cases` that are functions by calling them on the given data.', () => {
    let a = new Source();
    let b = new Switch([
      (n: number) => n % 2 == 0,
      (n: number) => n % 2 == 1,
    ]);

    b.target.from(a);

    let res = '';
    b.case(0).observable.subscribe(() => res = 'even');
    b.case(1).observable.subscribe(() => res = 'odd');

    a.send(2);
    res.should.equal('even');

    a.send(3);
    res.should.equal('odd');
  });

  it('should work with async functions in `cases` as well.', done => {
    let a = new Source();
    let b = new Switch([
      (n: number) => n % 2 == 0,
      (n: number, done: (_: boolean) => void) => {
        setTimeout(() => done(n % 2 == 1), 5);
      },
    ]);

    b.target.from(a);

    let res = '';
    b.case(0).observable.subscribe(() => res = 'even');
    b.case(1).observable.subscribe(val => {
      val.should.equal(3);
      res.should.not.equal('even');
      done();
    });
    a.send(3);
  });
});