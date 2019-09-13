import { Clearable } from '../shared/clearable';

import { PinLike } from '../pin/pin-like';
import { PinMap } from '../pin/pin-map';

import { isSignature, Signature } from './signature';


/**
 *
 * Denotes objects that can behave like an [agent](https://connective.dev/docs/agent).
 *
 */
export interface AgentLike extends Clearable {

  /**
   *
   * @param label
   * @returns the input pin corresponding to given label
   * @throws an error if given label is not allowed by the agent's
   * [signature](https://connective.dev/docs/agent#signature).
   *
   */
  in(label: string | number): PinLike;

  /**
   *
   * @param label
   * @returns the output pin corresponding to given label
   * @throws an error if given label is not allowed by the agent's
   * [signature](https://connective.dev/docs/agent#signature).
   *
   */
  out(label: string | number): PinLike;

  /**
   *
   * A `PinMap` object referencing all of input pins of the agent.
   *
   */
  inputs: PinMap;

  /**
   *
   * A `PinMap` object referencing all of output pins of the agent.
   *
   */
  outputs: PinMap;

  /**
   *
   * The [signature](https://connective.dev/docs/agent#signature) of the agent.
   *
   */
  signature: Signature;
}


/**
 *
 *
 * @param whatever
 * @returns `true` if `whatever` satisfies `AgentLike` interface.
 *
 */
export function isAgentLike(whatever: any): whatever is AgentLike {
  return whatever !== undefined && (typeof whatever.in == 'function') && (typeof whatever.out == 'function')
    && whatever.inputs instanceof PinMap && whatever.outputs instanceof PinMap &&
    whatever.signature !== undefined && isSignature(whatever.signature);
}
