import { Observable, PartialObserver, Subscription } from 'rxjs';

import { Emission } from '../shared/emission';
import { Clearable } from '../shared/clearable';


/**
 * 
 * Denotes objects behaving like a [pin](https://connective.dev/docs/pin)
 * 
 */
export interface PinLike extends Clearable {
  /**
   * 
   * Connects given pins to this pin-like. Typically, when a `PartialFlow` is
   * among given pins, all of its exit pins are connected to this pin-like
   * (read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection)).
   * 
   * @param pins 
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its entry pins will be added to the group.
   * 
   * @note these are typical behaviours of `PinLike`s, and the specific behavior of each might be different.
   * 
   */
  from(...pins: PinLike[]): PinLike;

  /**
   * 
   * Connects this pin-like to given pins. Typically, when a `PartialFlow` is
   * among given pins, this pin-like will be connected to all of its entry pins
   * (read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection)).
   * 
   * @param pins 
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its exit pins added to the group.
   * 
   * @note these are typical behaviours of `PinLike`s, and the specific behavior of each might be different.
   * 
   */
  to(...pins: PinLike[]): PinLike;

  /**
   * 
   * Connects given pins to this pin-like serially.
   * - For [groups](https://connective.dev/docs/group), this means:
   *   - For single pins among given pins, they will be connected to pins of the group serially,
   *     i.e. first to the first, second to the second, etc.
   *   - For `PartialFlow`s among given pins, their exit pins will be connected serially to pins of the group.
   * - For [single pins](https://connective.dev/docs/pin), this means:
   *   - For single pins among given pins, they will simply be connected to this pin-like
   *   - For `PartialFlow`s among given pins, the first of their exit pins will be connected to this pin-like.
   * 
   * You can read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection).
   * 
   * @param pins 
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its entry pins will be added to the group.
   * 
   * @note these are typical behaviours of `PinLike`s, and the specific behavior of each might be different.
   * 
   */
  serialFrom(...pins: PinLike[]): PinLike;

  /**
   * 
   * Connects this pin-like to given pins serially.
   * - For [groups](https://connective.dev/docs/group), this means:
   *   - For single pins among given pins, pins of this group will be conencted to them serially,
   *     i.e. first to the first, second to the second, etc.
   *   - For `PartialFlow`s among given pins, pins of the group will be connected to their entry pins serially.
   * - For [single pins](https://connective.dev/docs/pin), this means:
   *   - For single pins among given pins, this pin-like will simply be connected to them.
   *   - For `PartialFlow`s among given pins, this pin will be connected to their first entry pin.
   * 
   * You can read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection).
   * 
   * @param pins 
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its exit pins added to the group.
   * 
   * @note these are typical behaviours of `PinLike`s, and the specific behavior of each might be different.
   * 
   */
  serialTo(...pins: PinLike[]): PinLike;

  /**
   * 
   * The underlying [`Observable`](https://rxjs-dev.firebaseapp.com/guide/observable) of the pin.
   * 
   * @throws an error if this pin-like does not have an underlying observable (for example, when it is a
   * [group](https://connective.dev/docs/group)).
   * 
   */
  observable: Observable<Emission>;

  subscribe(observer?: PartialObserver<any>): Subscription;
    /**
   * 
   * Subscribes given function or partial observer to the observable of this pin.
   * The subscriber will recieve the emitted values and not the emission object itself,
   * so if you need to access the emission (for example, to access its context),
   * use `.observable.subscribe()` instead.
   * 
   * @param observerOrNext either an [observer object](https://github.com/ReactiveX/rxjs/blob/master/doc/observer.md),
   * or a callback handling incoming values.
   * @param error a callback handling incoming errors.
   * @param complete a callback that will be invoked when the underlying observable sequence completes, for example
   * when the sources are all cleared out.
   * @returns the subscription object. The pin itself will track this subscription and clear it out when
   * its `.clear()` is invoked. If you wish to unsubscribe the subscription earlier than the time you clear
   * the pin out, then hold a reference to it and also remove it from subscriptions tracked by the pin
   * using `.untrack()`.
   * 
   */
  subscribe(next?: (value: any) => void, error?: (error: any) => void, complete?: () => void): Subscription;
}


/**
 * 
 * Checks if a given object satisfies the `PinLike` interface
 * 
 * @param whatever 
 * 
 */
export function isPinLike(whatever: any): whatever is PinLike {
  return whatever !== undefined && (typeof whatever.from == 'function') && (typeof whatever.to == 'function')
      && whatever.observable instanceof Observable &&
      (typeof whatever.subscribe == 'function');
}
