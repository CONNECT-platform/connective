import { should, expect } from 'chai'; should();

import source from '../source';
import pin from '../pin';
import sink from '../sink';
import group, { Group } from '../group';


describe('Group', () => {
  describe('.subscribe()', () => {
    it('should subscribe the given function to all pins in the group.', () => {
      let r = 0;
      let a = source();
      a.to(group(pin(), pin())).subscribe(() => r++);
      a.send();
      r.should.equal(2);
    });
  });

  describe('.clear()', () => {
    it('should clear all pins in the group.', () => {
      let a = pin(); let b = pin();
      source().to(a, b);
      a.connected.should.be.true;
      b.connected.should.be.true;
      group(a, b).clear();
      a.connected.should.be.false;
      b.connected.should.be.false;
    });
  });

  describe('.bind()', () => {
    it('should bind all bindable pins in the group', () => {
      let a = sink(); let b = sink(); let c = pin();
      group(a, b, c).bind();
      a.locked.should.be.true;
      b.locked.should.be.true;
      c.locked.should.be.false;
    });
  });

  describe('.observable', () => {
    it('should throw an error.', () => {
      expect(() => group().observable).to.throw();
    });
  });

  describe('.from()', () => {
    it('should connect given pins to all pins in the group.', () => {
      let r = 1;
      let s = source(); let t = source();
      let g = group(sink(() => r *= 2), sink(() => r *= 3));
      g.from(s, t); g.bind();
      s.send(); t.send();
      r.should.equal(36);
    });

    it('should also connect properly to another group.', () => {
      let r = 0;
      let s = source();
      let a = group(sink(() => r++), sink(() => r++));
      let b = group(sink(() => r++), sink(() => r++));
      b.from(a).from(s);
      b.to(pin()).subscribe();
      s.send();
      r.should.equal(8);
    });

    it('should return a Group when called on multiple pins.', () => {
      group().from(pin(), pin()).should.be.instanceof(Group);
    });

    it('should not return a Group when called on one pin.', () => {
      group().from(pin()).should.not.be.instanceof(Group);
    });
  });

  describe('.to()', () => {
    it('should connect given pins to all pins in the group.', () => {
      let r = 1;
      let s = source(); let t = source();
      let a = sink(() => r *= 2); let b = sink(() => r *= 3);
      group(s, t).to(a, b);
      a.bind(); b.bind();
      s.send(); t.send();
      r.should.equal(36);
    });

    it('should also connect properly to another group.', () => {
      let r = 1;
      let s = source(); let t = source();
      let a = sink(() => r *= 2); let b = sink(() => r *= 3);
      group(s, t).to(group(a, b));
      a.bind(); b.bind();
      s.send(); t.send();
      r.should.equal(36);
    });

    it('should return a Group when called on multiple pins.', () => {
      group().to(pin(), pin()).should.be.instanceof(Group);
    });

    it('should not return a Group when called on one pin.', () => {
      group().to(pin()).should.not.be.instanceof(Group);
    });
  });

  describe('.pins', () => {
    it('should be all pins of the group.', () => {
      let a = pin(); let b = pin();
      group(a, b).pins.should.eql([a, b]);
    });
  });
});

describe('group()', () => {
  it('should return a group of all given pins.', () => {
    let a = pin(); let b = pin();
    let g = group(a, b);

    g.should.be.instanceof(Group);
    g.pins.should.eql([a, b]);
  });
});
