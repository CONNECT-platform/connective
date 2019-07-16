import { isBindable } from '../shared/bindable';

import { Agent } from './agent';


export default function() {
  return function<T extends {new(...args: any[]): Agent}>(_Class: T) {
    let agent = new _Class();
    if (isBindable(agent)) {
      agent.bind();
    }

    return class extends _Class {
      static readonly instance = agent;
    }
  }
}
