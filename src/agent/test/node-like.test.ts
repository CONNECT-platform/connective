import { should } from 'chai'; should();

import { PinMap } from '../../pin/pin-map';
import control from '../../pin/control';

import { isNodeLike } from '../node-like';


describe('isNodeLike()', () => {
  it('should be true for stuff that are `NodeLike` and false for whatever else.', () => {
    isNodeLike({
      in(){}, out(){},
      inputs: new PinMap(), outputs: new PinMap(),
      signature: {outputs: []},
      control: control(),
    }).should.be.true;

    isNodeLike({
      in(){}, out(){},
      inputs: new PinMap(), outputs: new PinMap(),
      signature: {outputs: []}
    }).should.be.false;

    isNodeLike({
      in(){}, out(){},
      inputs: new PinMap(), outputs: new PinMap(),
      signature: {outputs: []},
      control: 'hellow',
    }).should.be.false;

    isNodeLike({
      in(){}, out(){},
      inputs: new PinMap(), outputs: new PinMap(),
      control: control(),
    }).should.be.false;

    isNodeLike(true).should.be.false;
    isNodeLike(undefined).should.be.false;
  });
});
