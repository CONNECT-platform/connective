import { should } from 'chai'; should();

import fork, { Fork } from '../fork';
import pin from '../pin';
import source from '../source';


describe('Fork', () => {
  it('should send the emission to outgoing pins with the same fork tag.', () => {
    let a = source();
    let b = pin(); let c = pin();

    a.to(fork()).to(b, c);

    let _b_fork: any = undefined; let _c_fork: any = undefined;
    b.observable.subscribe(e => _b_fork = e.context.__fork);
    c.observable.subscribe(e => _c_fork = e.context.__fork);

    a.send(2);
    _b_fork.should.eql(_c_fork);
  });

  it('should create unique fork tags for each incoming emission.', () => {
    let a = source();
    let b = pin(); let c = pin();

    a.to(fork()).to(b, c);

    let _b_fork: any[] = []; let _c_fork: any[] = [];
    b.observable.subscribe(e => _b_fork.push(e.context.__fork));
    c.observable.subscribe(e => _c_fork.push(e.context.__fork));

    a.send(2);
    a.send(42);
    _b_fork[0].should.eql(_c_fork[0]);
    _b_fork[1].should.eql(_c_fork[1]);
    _b_fork[0].should.not.eql(_b_fork[1]);
  });

  it('should preserve already set fork tags when chain forking.', () => {
    let a = source();
    let b = pin(); let c = pin();

    a.to(fork()).to(b, c.from(fork()));

    let _b_fork: any = undefined; let _c_fork: any = undefined;
    b.observable.subscribe(e => _b_fork = e.context.__fork);
    c.observable.subscribe(e => _c_fork = e.context.__fork);

    a.send(2);

    _b_fork.length.should.equal(1);
    _c_fork.length.should.equal(2);
    _b_fork[0].should.equal(_c_fork[0]);
    _b_fork[0].should.not.equal(_c_fork[1]);
  });
});

describe('fork()', () => {
  it('should create a `Fork` pin.', () => {
    fork().should.be.instanceof(Fork);
  });
});
