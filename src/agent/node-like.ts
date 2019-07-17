import { Control } from '../pin/control';

import { isAgentLike, AgentLike } from './agent-like';


export interface NodeLike extends AgentLike{
  control: Control;
}


export function isNodeLike(whatever: any): whatever is NodeLike {
  return whatever !== undefined && whatever.control instanceof Control && isAgentLike(whatever);
}
