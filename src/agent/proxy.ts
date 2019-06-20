import { Subscription } from 'rxjs';

import { Source } from '../pin/source';

import { Agent } from './agent';


export class Proxy extends Agent {
  public proxy(agent: Agent): Subscription {

    let subs = new Subscription(() => {
      this.untrack(subs);
    });

    this.inputs.entries.forEach(entry => agent.in(entry[0]).from(entry[1]));
    this.outputs.entries.forEach(entry => {
      subs.add(agent.out(entry[0]).observable.subscribe(data => {
        (entry[1] as Source).send(data);
      }));
    });

    this.track(subs);
    return subs;
  }

  protected createOutput(label: string) {
    this.checkOutput(label);
    return new Source();
  }
}