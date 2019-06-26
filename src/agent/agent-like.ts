import { PinLike } from '../pin/pin-like';
import { PinMap } from '../pin/pin-map';

import { Signature } from './signature';


export interface AgentLike {
  in(label: string | number): PinLike;
  out(label: string | number): PinLike;
  clear(): this;

  inputs: PinMap;
  outputs: PinMap;
  signature: Signature;
}
