import { should, expect } from 'chai'; should();

import { group, Group } from '../group';
import { source, Source } from '../source';
import { pin, Pin } from '../pin';
import { map } from '../map';
import { partialFlow, PartialFlow } from '../partial-flow';


const testFlow = () => {
  let i1 = pin(); let i2 = pin();
  let o1 = pin(); let o2 = pin();
  i1.to(map((x: any) => '1-2:: ' + x)).to(o2);
  i2.to(map((x: any) => '2-1:: ' + x)).to(o1);
  return <[Pin[], Pin[]]>[[i1, i2], [o1, o2]];
};


describe('PartialFlow', () => {
  it('should be connectible properly via `.to()`.', () => {
    let a = source();
    let res = <string[]>[];

    a.to(partialFlow(testFlow)).to(pin()).subscribe(v => res.push(v));

    a.send('hellow');

    res.length.should.equal(2);
    res.should.include('1-2:: hellow');
    res.should.include('2-1:: hellow');
  });

  it('should be connectible properly via `.from()`', () => {
    let b = pin();
    let res = <string[]>[];

    let a = b.from(partialFlow(testFlow)).from(source()) as Source;
    b.subscribe(v => res.push(v));

    a.send('hellow');

    res.length.should.equal(2);
    res.should.include('1-2:: hellow');
    res.should.include('2-1:: hellow');
  });

  it('should be connectible serially using `serialTo()`', () => {
    let a1 = source(); let a2 = source();
    let b1 = pin(); let b2 = pin();
    let r1 = <string[]>[]; let r2 = <string[]>[];


    group(a1, a2).serialTo(partialFlow(testFlow)).serialTo(b1, b2);
    b1.subscribe(v => r1.push(v));
    b2.subscribe(v => r2.push(v));

    a1.send('A1'); a2.send('A2');

    r1.should.eql(['2-1:: A2']);
    r2.should.eql(['1-2:: A1']);
  });

  it('should be connectible serially using `serialFrom()`', () => {
    let a1 = source(); let a2 = source();
    let b1 = pin(); let b2 = pin();
    let r1 = <string[]>[]; let r2 = <string[]>[];


    group(b1, b2).serialFrom(partialFlow(testFlow)).serialFrom(a1, a2);
    b1.subscribe(v => r1.push(v));
    b2.subscribe(v => r2.push(v));

    a1.send('A1'); a2.send('A2');

    r1.should.eql(['2-1:: A2']);
    r2.should.eql(['1-2:: A1']);
  });
});