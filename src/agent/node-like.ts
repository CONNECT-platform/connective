import { Control } from '../pin/control';

import { isAgentLike, AgentLike } from './agent-like';


/**
 *
 * Denotes objects that behave like a [node](https://connective.dev/docs/node).
 *
 */
export interface NodeLike extends AgentLike{
  /**
   *
   * You can typically control the behavior of a `NodeLike` by emitting
   * values to its `.control`, for example making it wait for a cue even if all
   * of its input parameters are ready.
   *
   */
  control: Control;
}


/**
 *
 * @param whatever
 * @returns `true` if `whatever` is `NodeLike`
 *
 */
export function isNodeLike(whatever: any): whatever is NodeLike {
  return whatever !== undefined && whatever.control instanceof Control && isAgentLike(whatever);
}
