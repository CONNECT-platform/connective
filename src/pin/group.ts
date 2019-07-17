import { Observable, PartialObserver, Subscription } from 'rxjs';

import { isBindable, Bindable } from '../shared/bindable';
import { Emission } from '../shared/emission';
import { ResolveCallback, ErrorCallback, NotifyCallback } from '../shared/types';

import { GroupObservableError } from './errors/group-subscription';

import { PinLike } from './pin-like';


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
    if (pins.length == 1) return pins[0];
    else return new Group(pins);
  }

  to(...pins: PinLike[]): PinLike {
    pins.forEach(pin => this.pins.forEach(p => p.to(pin)));
    if (pins.length == 1) return pins[0];
    else return new Group(pins);
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


export default group;
