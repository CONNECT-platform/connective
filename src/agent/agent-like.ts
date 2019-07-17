import { Clearable } from '../shared/clearable';

import { PinLike } from '../pin/pin-like';
import { PinMap } from '../pin/pin-map';

import { isSignature, Signature } from './signature';


export interface AgentLike extends Clearable {
  in(label: string | number): PinLike;
  out(label: string | number): PinLike;

  inputs: PinMap;
  outputs: PinMap;
  signature: Signature;
}


export function isAgentLike(whatever: any): whatever is AgentLike {
  return whatever !== undefined && (typeof whatever.in == 'function') && (typeof whatever.out == 'function')
    && whatever.inputs instanceof PinMap && whatever.outputs instanceof PinMap &&
    whatever.signature !== undefined && isSignature(whatever.signature);
}
