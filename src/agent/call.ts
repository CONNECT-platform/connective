import { Subscription } from 'rxjs';

import emission from '../shared/emission';

import map from '../pin/map';
import value from '../pin/value';
import source, { Source } from '../pin/source';

import { Agent } from './agent';


export type AgentFactory = () => Agent;
export type ExecResult = { label: string; value: any };


export function exec(factory: AgentFactory,
  sub?: (s: Subscription) => void,
  unsub?: (s: Subscription) => void,
  outs?: () => string[]
) {
  return map((data, done, error, context) => {
    let _agent = factory();
    let _sources = <{[input: string]: Source}>{};
    let _subs = new Subscription();
    if (sub) sub(_subs);

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

    if (data)
      Object.entries(data).forEach(([input, value]) => _sources[input].emit(emission(value, context)));
  });
}


export function call(factory: AgentFactory, data: {[input: string]: any}) { return value(data).to(exec(factory)); }


export default call;
