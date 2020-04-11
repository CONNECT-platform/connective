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
/**
 *
 * Represents a partial reactive flow, with some entry pins going into it
 * and some exit pins coming out of it.
 *
 */
export abstract class PartialFlow<O=unknown, I=unknown> extends Tracker implements PinLike<O, I> {
  /**
   *
   * Override this to specify the entry pins of this partial flow.
   * Read more about this [here](https://connective.dev/docs/agent#implicit-connection).
   *
   */
  abstract get entries(): Group<unknown, I>;

  /**
   *
   * Override this to specify the exit pins of this partial flow.
   * Read more about this [here](https://connective.dev/docs/agent#implicit-connection).
   *
   */
  abstract get exits(): Group<O, unknown>;

  /**
   *
   * Connects all given pins to all of its entry pins
   *
   * @param pins
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its entry pins will be added to the group.
   *
   */
  from<T>(...pins: PinLike<I, T>[]): PinLike<unknown, T> {
    return this.entries.from(...pins);
  }

  /**
   *
   * Connects all of its exit pins to given pins
   *
   * @param pins
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its exit pins added to the group.
   *
   */
  to<T>(...pins: PinLike<T, O>[]): PinLike<T> {
    return this.exits.to(...pins);
  }

  /**
   *
   * Connects all given pins serially to its entry pins
   *
   * @param pins
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its entry pins will be added to the group.
   *
   */
  serialFrom<T>(...pins: PinLike<I, T>[]): PinLike<unknown, T> {
    return this.entries.serialFrom(...pins);
  }

  /**
   *
   * Connects all of its exit pins to given pins
   *
   * @param pins
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its exit pins added to the group.
   *
   */
  serialTo<T>(...pins: PinLike<T, O>[]): PinLike<T> {
    return this.exits.serialTo(...pins);
  }

  get observable(): Observable<Emission<O>> {
    return this.exits.observable;
  }

  subscribe(observer?: PartialObserver<O>): Subscription;
  subscribe(next?: (value: O) => void, error?: (error: any) => void, complete?: () => void): Subscription;
  /**
   *
   * Subscribes to all of its exit pins. Returns a composite subscription of
   * all created subscriptions.
   *
   */
  subscribe(
    _?: PartialObserver<O> | ResolveCallback<O>,
    __?: ErrorCallback,
    ___?: NotifyCallback,
  ): Subscription {
    return this.exits.subscribe(_ as any, __, ___);
  }
}


export type PartialFlowFactory<O, I> = () => [
  Group<unknown, I> | PinLike<unknown, I>[], 
  Group<O, unknown> | PinLike<O, unknown>[]
];


class InlineFlow<O=unknown, I=unknown> extends PartialFlow<O, I> {
  entries: Group<unknown, I>; exits: Group<O, unknown>;

  constructor(readonly factory: PartialFlowFactory<O, I>) {
    super();
    let [entries, exits] = factory();
    this.entries = (entries instanceof Group)?entries:group(...entries);
    this.exits = (exits instanceof Group)?exits:group(...exits);
  }
}


/**
 *
 * Creates a partial flow, using the given factory function. The factory function
 * should return either a [`group`](https://connective.dev/docs/group) or an array
 * of [pins](https://connective.dev/docs/pin) for inputs, and a group or an array of pins
 * for outputs, in array format itself (first object being the inputs, second the outputs).
 *
 * @param factory
 *
 */
export function partialFlow<O, I>(factory: PartialFlowFactory<O, I>) { return new InlineFlow(factory); }


export default partialFlow;