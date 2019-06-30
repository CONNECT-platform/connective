import { Clearable } from '../shared/clearable';

import { PinLike } from '../pin/pin-like';
import { PinMap } from '../pin/pin-map';

import { Signature } from './signature';


export interface AgentLike extends Clearable {
  in(label: string | number): PinLike;
  out(label: string | number): PinLike;

  inputs: PinMap;
  outputs: PinMap;
  signature: Signature;
}
