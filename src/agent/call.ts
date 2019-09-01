import { Subscription } from 'rxjs';

import emission from '../shared/emission';

import map from '../pin/map';
import value from '../pin/value';
import source, { Source } from '../pin/source';

import { Agent } from './agent';


export type AgentFactory = () => Agent;
export type ExecResult = { label: string; value: any };


/**
 * 
 * Creates a [map](https://connective.dev/docs/map) pin. This map pin will
 * expect objects whose keys matches agents that will be created by given factory.
 * For each such object, the factory will be called and a new instance of the agent
 * will be created, the provided inputs (key-values of the incoming object) will
 * be fed to its inputs, and its first ouput will be passed on.
 * 
 * @param factory the agent factory to create new instances per incoming object
 * @param sub a callback to handle the subscription object holding the reference to all
 * subscriptions created in response to each incoming object
 * @param unsub a callback to handle when the created subscriptions of each incoming
 * object are unsubscribed from
 * @param outs an optional function to be used to determine possible outputs instead of utilizing
 * each created agent's signature.
 * 
 */
export function exec(factory: AgentFactory,
  sub?: (s: Subscription) => void,
  unsub?: (s: Subscription) => void,
  outs?: () => string[]
) {
  return map((data, done, error, context) => {
    let _agent = factory();
    let _sources = <{[input: string]: Source}>{};
    let _subs = new Subscription();

    let _cleanup = () => {
      Object.values(_sources).forEach(s => s.clear());
      _agent.clear();
      _subs.unsubscribe();
      if (unsub) unsub(_subs);
    };

    if (data)
      Object.keys(data).forEach((input) => _agent.in(input).from(_sources[input] = source()));

    let _outs = _agent.signature.outputs || [];
    if (outs) _outs = outs();
    _outs.forEach((label) => {
      _subs.add(_agent.out(label).subscribe(
        value => { _cleanup(); done({ label, value }); },
        err => { _cleanup(); error(err); }
      ));
    });

    if (sub) sub(_subs);

    if (data)
      Object.entries(data).forEach(([input, value]) => _sources[input].emit(emission(value, context)));
  });
}


/**
 * 
 * Creates an agent using given agent factory, feed its inputs based on key-value
 * pairs of given data, and return a pin who will emit the first output of the created agent.
 * 
 * @param factory
 * @param data 
 * 
 */
export function call(factory: AgentFactory, data: {[input: string]: any}) { return value(data).to(exec(factory)); }


export default call;
