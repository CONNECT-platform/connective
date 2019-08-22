import { Observable, PartialObserver, Subscription } from 'rxjs';

import { isBindable, Bindable } from '../shared/bindable';
import { Emission } from '../shared/emission';
import { ResolveCallback, ErrorCallback, NotifyCallback } from '../shared/types';

import { GroupObservableError } from './errors/group-subscription';

import { PinLike } from './pin-like';
import { PartialFlow } from './partial-flow';


export class Group implements PinLike, Bindable {
  readonly pins: PinLike[];

  constructor(pins: PinLike[]) {
    this.pins = pins;
  }

  get observable(): Observable<Emission> {
    throw new GroupObservableError();
  }

  from(...pins: PinLike[]): PinLike {
    pins.forEach(pin => this.pins.forEach(p => p.from(pin)));
    return traverseFrom(...pins);
  }

  to(...pins: PinLike[]): PinLike {
    pins.forEach(pin => this.pins.forEach(p => p.to(pin)));
    return traverseTo(...pins);
  }

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

  clear() {
    this.pins.forEach(pin => pin.clear());
    return this;
  }

  bind() {
    this.pins.forEach(pin => {
      if (isBindable(pin)) pin.bind();
    });

    return this;
  }

  subscribe(observer?: PartialObserver<any>): Subscription;
  subscribe(next?: (value: any) => void, error?: (error: any) => void, complete?: () => void): Subscription;
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


export function group(...pins: PinLike[]) { return new Group(pins); }

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
