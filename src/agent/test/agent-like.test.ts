import { should } from 'chai'; should();

import { PinMap } from '../../pin/pin-map';

import { isAgentLike } from '../agent-like';


describe('isAgentLike()', () => {
  it('should be true for stuff that are `AgentLike` and false for whatever else.', () => {
    isAgentLike({
      in(){}, out(){},
      inputs: new PinMap(), outputs: new PinMap(),
      signature: {outputs: []}
    }).should.be.true;

    isAgentLike({
      in(){}, out(){},
      inputs: new PinMap(), outputs: new PinMap(),
    }).should.be.false;

    isAgentLike({
      in(){},
      inputs: new PinMap(), outputs: new PinMap(),
      signature: {outputs: []}
    }).should.be.false;

    isAgentLike({
      in(){}, out(){},
      inputs: new PinMap(), outputs: 42,
      signature: {outputs: []}
    }).should.be.false;

    isAgentLike(42).should.be.false;
    isAgentLike(undefined).should.be.false;
  });
});
