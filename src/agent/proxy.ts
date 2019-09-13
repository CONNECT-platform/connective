import { Subscription } from 'rxjs';

import { Emission } from '../shared/emission';

import { Source } from '../pin/source';

import { Signature } from './signature';
import { Agent } from './agent';
import { AgentLike } from './agent-like';


/**
 *
 * Represents [proxy](https://connective.dev/docs/proxy) agents.
 *
 */
export class Proxy extends Agent {
  /**
   *
   * Proxies given agent, connecting it to the rest of the flow
   * that the proxy itself is connected to.
   *
   * @param agent
   * @returns a [subscription](https://rxjs-dev.firebaseapp.com/guide/subscription) object
   * that can be unsubscribed (call `.unsubscribe()`) to unproxy given agent.
   *
   */
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


/**
 *
 * Creates a [proxy](https://connective.dev/docs/proxy) agent.
 * [Checkout the docs](https://connective.dev/docs/proxy) for examples and further information.
 *
 * @param signature the signature of the proxied agent (or a projection of the signature that needs
 * to be proxied).
 *
 */
export function proxy(signature: Signature) { return new Proxy(signature); }


export default proxy;
