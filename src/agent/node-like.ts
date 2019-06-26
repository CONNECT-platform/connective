import { Control } from '../pin/control';

import { AgentLike } from './agent-like';


export interface NodeLike extends AgentLike{
  control: Control;
}
