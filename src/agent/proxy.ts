import { Subscription } from 'rxjs';

import { Emission } from '../shared/emission';

import { Source } from '../pin/source';

import { Signature } from './signature';
import { Agent } from './agent';
import { AgentLike } from './agent-like';


export class Proxy extends Agent {
  public proxy(agent: AgentLike): Subscription {

    let subs = new Subscription(() => {
      this.untrack(subs);
    });

    this.inputs.entries.forEach(entry => agent.in(entry[0]).from(entry[1]));
    this.outputs.entries.forEach(entry => {
      subs.add(agent.out(entry[0]).observable.subscribe((emission: Emission) => {
        (entry[1] as Source).emit(emission);
      }));
    });

    return this.track(subs);
  }

  protected createOutput(label: string) {
    this.checkOutput(label);
    return new Source();
  }
}


export function proxy(signature: Signature) { return new Proxy(signature); }


export default proxy;
