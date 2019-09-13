import { Observable, PartialObserver, Subscription } from 'rxjs';

import { isBindable, Bindable } from '../shared/bindable';
import { Emission } from '../shared/emission';
import { ResolveCallback, ErrorCallback, NotifyCallback } from '../shared/types';

import { GroupObservableError } from './errors/group-subscription';

import { PinLike } from './pin-like';
import { PartialFlow } from './partial-flow';


/**
 *
 * Represents [groups of pins](https://connective.dev/docs/group).
 *
 */
export class Group implements PinLike, Bindable {
  /**
   *
   * The array of all pins within the group.
   *
   */
  readonly pins: PinLike[];

  constructor(pins: PinLike[]) {
    this.pins = pins;
  }

  /**
   *
   * @warning accessing this will result in an error since groups do not have
   * underlying observables of their own.
   *
   */
  get observable(): Observable<Emission> {
    throw new GroupObservableError();
  }

  /**
   *
   * Connects all given pins to all pins in this group, so
   * `group(c, d).from(a, b)` means both `a` and `b` will be connected
   * to both `c` and `d`.
   *
   * If any `PartialFlow` is among given pins, all of the exit pins of the partial flow will be
   * connected to all of the pins of this group
   * (read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection)).
   *
   * @param pins pins to be connected to pins of this group
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its entry pins will be added to the group.
   *
   */
  from(...pins: PinLike[]): PinLike {
    pins.forEach(pin => this.pins.forEach(p => p.from(pin)));
    return traverseFrom(...pins);
  }

  /**
   *
   * Connects all pins of this group to all of the given pins, so
   * `group(a, b).to(c, d)` means both `a` and `b` will be connected to
   * both `c` and `d`.
   *
   * If any `PartialFlow` is among the given pins, all pins of the group will be connected to all of
   * its entry pins (read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection)).
   *
   * @param pins the pins to connect pins of this group to
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its exit pins added to the group.
   *
   */
  to(...pins: PinLike[]): PinLike {
    pins.forEach(pin => this.pins.forEach(p => p.to(pin)));
    return traverseTo(...pins);
  }

  /**
   *
   * Connects given pins serially to pins of this group, i.e. the first to the first,
   * second to the second, etc. If any `PartialFlow` is among the given pins, then
   * its exit pins will be connected serially to pins of this group
   * (read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection)).
   * If a mixture of `PartialFlow`s and normal pins are given, the normal pins will
   * be connected to pins of this group serially without counting the partial flows, and the
   * partial flows will each be connected to pins of this group as described.
   *
   * @param pins pins to be connected to pins of this group serially.
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its entry pins will be added to the group.
   *
   */
  serialFrom(...pins: PinLike[]): PinLike {
    (<PartialFlow[]>pins.filter(pin => pin instanceof PartialFlow)).forEach(flow => {
      for (let i = 0; i < Math.min(this.pins.length, flow.exits.pins.length); i++)
        this.pins[i].from(flow.exits.pins[i]);
    });

    let purePins = pins.filter(p => !(p instanceof PartialFlow));
    for (let i = 0; i < Math.min(this.pins.length, purePins.length); i++)
      this.pins[i].from(purePins[i]);

    return traverseFrom(...pins);
  }

  /**
   *
   * Connects pins of this group serially to given pins, i.e. first to the first,
   * second to the second, etc. If any `PartialFlow` is among the given pins, pins of
   * this group will be connected serially to its entries
   * (read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection)).
   * If a mixture of `PartialFlow`s and normal pins are given, pins of this group will
   * be connected to the normal pins serially without counting the partial flows, and they
   * will be connected to the partial flows as described.
   *
   * @param pins pins that pins of this group should connect to serially.
   * @returns a [group](https://connective.dev/docs/group) of the given pins. If any `PartialFlow`
   * was among the given pins, its exit pins added to the group.
   *
   */
  serialTo(...pins: PinLike[]): PinLike {
    (<PartialFlow[]>pins.filter(pin => pin instanceof PartialFlow)).forEach(flow => {
      for (let i = 0; i < Math.min(this.pins.length, flow.entries.pins.length); i++)
        this.pins[i].to(flow.entries.pins[i]);
    });

    let purePins = pins.filter(p => !(p instanceof PartialFlow));
    for (let i = 0; i < Math.min(this.pins.length, purePins.length); i++)
      this.pins[i].to(purePins[i]);

    return traverseTo(...pins);
  }

  /**
   *
   * Calls `.clear()` on all pins of the group
   *
   */
  clear() {
    this.pins.forEach(pin => pin.clear());
    return this;
  }

  /**
   *
   * Calls `.bind()` on all pins of the group
   *
   */
  bind() {
    this.pins.forEach(pin => {
      if (isBindable(pin)) pin.bind();
    });

    return this;
  }

  subscribe(observer?: PartialObserver<any>): Subscription;
  subscribe(next?: (value: any) => void, error?: (error: any) => void, complete?: () => void): Subscription;
  /**
   *
   * Subscribes given observer (or callback functions) to all pins of the group.
   *
   * @returns a composite subscription holding all of the subscriptions made.
   *
   */
  subscribe(
    _?: PartialObserver<any> | ResolveCallback<any>,
    __?: ErrorCallback,
    ___?: NotifyCallback,
  ): Subscription {
    return this.pins.reduce((sub, pin) => {
      sub.add(pin.subscribe(_ as any, __, ___));
      return sub;
    }, new Subscription());
  }
}


/**
 *
 * Creates a [group of pins](https://connective.dev/docs/group) based on given pins.
 *
 * @param pins
 *
 */
export function group(...pins: PinLike[]) { return new Group(pins); }

/**
 *
 * Determines which pins should be considered if in a connection chain
 * we are connecting to the given pins. This is typically a `Group` consisting
 * of given pins, but if any `PartialFlow`s are among them, their exit pins are
 * added to the group instead.
 *
 * @param pins
 *
 */
export function traverseTo(...pins: PinLike[]): PinLike {
  if (pins.length == 1) {
    let pin = pins[0];

    if (pin instanceof PartialFlow) return pin.exits;
    else return pin;
  }
  else return group(...pins.reduce((all, pin) => {
    if (pin instanceof PartialFlow) return all.concat(pin.exits.pins);
    else return all.concat([pin]);
  }, <PinLike[]>[]));
}

/**
 *
 * Determines which pins should be considered if in a connection chain
 * we are connecting from the given pins. This is typically a `Group` consisting
 * of given pins, but if any `PartialFlow`s are among them, their entry pins are
 * added to the group instead.
 *
 * @param pins
 *
 */
export function traverseFrom(...pins: PinLike[]): PinLike {
  if (pins.length == 1) {
    let pin = pins[0];

    if (pin instanceof PartialFlow) return pin.entries;
    else return pin;
  }
  else return group(...pins.reduce((all, pin) => {
    if (pin instanceof PartialFlow) return all.concat(pin.entries.pins);
    else return all.concat([pin]);
  }, <PinLike[]>[]));
}


export default group;
