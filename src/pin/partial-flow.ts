import { Observable, PartialObserver, Subscription } from 'rxjs';

import { Emission } from '../shared/emission';
import { Tracker } from '../shared/tracker';
import { ResolveCallback, ErrorCallback, NotifyCallback } from '../shared/types';

import { PinLike } from './pin-like';
import group, { Group } from './group';


//
// TODO: write tests for this.
// TODO: make Agent inherit this, but default throwing error when used like this.
// TODO: make common agent types act as proper partial flows.
//
export abstract class PartialFlow extends Tracker implements PinLike {
  abstract get entries(): Group;
  abstract get exits(): Group;

  from(...pins: PinLike[]): PinLike {
    return this.entries.from(...pins);
  }

  to(...pins: PinLike[]): PinLike {
    return this.exits.to(...pins);
  }

  serialFrom(...pins: PinLike[]): PinLike {
    return this.entries.serialFrom(...pins);
  }

  serialTo(...pins: PinLike[]): PinLike {
    return this.exits.serialTo(...pins);
  }

  get observable(): Observable<Emission> {
    return this.exits.observable;
  }

  subscribe(observer?: PartialObserver<any>): Subscription;
  subscribe(next?: (value: any) => void, error?: (error: any) => void, complete?: () => void): Subscription;
  subscribe(
    _?: PartialObserver<any> | ResolveCallback<any>,
    __?: ErrorCallback,
    ___?: NotifyCallback,
  ): Subscription {
    return this.exits.subscribe(_ as any, __, ___);
  }
}


export type PartialFlowFactory = () => [Group | PinLike[], Group | PinLike[]];


class InlineFlow extends PartialFlow {
  entries: Group; exits: Group;

  constructor(readonly factory: PartialFlowFactory) {
    super();
    let [entries, exits] = factory();
    this.entries = (entries instanceof Group)?entries:group(...entries);
    this.exits = (exits instanceof Group)?exits:group(...exits);
  }
}


export function partialFlow(factory: PartialFlowFactory) { return new InlineFlow(factory); }


export default partialFlow;