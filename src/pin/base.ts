import { Observable, PartialObserver, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Emission } from '../shared/emission';
import { Tracker } from '../shared/tracker';
import { ResolveCallback, ErrorCallback, NotifyCallback } from '../shared/types';

import { Group, traverseFrom, traverseTo } from './group';
import { PinLike } from './pin-like';
import { PartialFlow } from './partial-flow';


//
// TODO: write tests for this
//
/**
 * 
 * The base class for all [pins](https://connective.dev/docs/pin).
 * 
 */
export abstract class BasePin extends Tracker implements PinLike {
  /**
   * 
   * Connects given [pin](https://connective.dev/docs/pin) to this pin.
   * Note that the operation might not be possible and result in an error.
   * 
   * @param _  the pin that gets connected to this pin.
   * 
   */
  abstract connect(_: PinLike): this;

  /**
   * 
   * The underlying observable of the pin. You can use this property
   * to access the [emissions](https://connective.dev/docs/emission) instead of
   * values, or to connect your CONNECTIVE flow into another observable sequence.
   * 
   */
  abstract observable: Observable<Emission>;

  /**
   * 
   * Will connect this pin to given pins. Will invoke `.from()` on the receiving pins.
   * If any `PartialFlow` is among the given pins, the connection will be made to all of
   * its entry pins (read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection)).
   * 
   * @param pins the pins to connect to
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its exit pins added to the group.
   * 
   */
  to(...pins: PinLike[]) {
    pins.forEach(pin => pin.from(this));
    return traverseTo(...pins);
  }

  /**
   * 
   * Will connect all given pins to this pin, by calling `.connect()` on each of them.
   * If any `PartialFlow` is among given pins, the exit pins of the partial flow will be
   * connected to this pin 
   * (read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection)).
   * 
   * @param pins the pins to be connected to this pin
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its entry pins will be added to the group.
   * 
   */
  from(...pins: PinLike[]) {
    pins.forEach(pin => {
      if (pin instanceof Group)
        pin.pins.forEach(p => this.connect(p));
      else if (pin instanceof PartialFlow)
        pin.exits.pins.forEach(o => this.connect(o));
      else
        this.connect(pin);
    });

    return traverseFrom(...pins);
  }

  /**
   * 
   * Connectss to given pins. This is same as `.to()`, except that when a `PartialFlow`
   * is among the given pins, this pin will be connected only to its first entry pin
   * (read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection)).
   * 
   * @param pins pins to connect this pin to
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its exit pins added to the group.
   * 
   */
  serialTo(...pins: PinLike[]) {
    pins.forEach(pin => {
      if (pin instanceof PartialFlow) {
        if (pin.entries.pins.length > 0)
          pin.entries.pins[0].from(this);
      }
      else pin.from(this);
    })

    return traverseTo(...pins);
  }

  /**
   * 
   * Connects given pins to this pin. This is same as `.from()`, except that when a `PartialFlow`
   * is among given pins, only its first exit pin will be connected to this pin
   * (read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection)).
   * 
   * @param pins pins to connect to this pin
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its entry pins will be added to the group.
   * 
   */
  serialFrom(...pins: PinLike[]) {
    pins.forEach(pin => {
      if (pin instanceof PartialFlow) {
        if (pin.exits.pins.length > 0)
          this.connect(pin.exits.pins[0]);
      }
      else this.connect(pin);
    });

    return traverseTo(...pins);
  }

  subscribe(observer?: PartialObserver<any>): Subscription;
  subscribe(next?: (value: any) => void, error?: (error: any) => void, complete?: () => void): Subscription;
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
  subscribe(
    observerOrNext?: PartialObserver<any> | ResolveCallback<any>,
    error?: ErrorCallback,
    complete?: NotifyCallback,
  ): Subscription {
    if (error || complete)
      return this.track(this.observable.pipe(
          map((e: Emission) => e.value)
        ).subscribe(observerOrNext as ResolveCallback<any>, error, complete));
    else
      return this.track(this.observable.pipe(
        map((e: Emission) => e.value)
      ).subscribe(observerOrNext as any));
  }
}
