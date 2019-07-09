import { Observable, PartialObserver, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Emission } from '../shared/emission';
import { Tracker } from '../shared/tracker';
import { ResolveCallback, ErrorCallback, NotifyCallback } from '../shared/types';

import group, { Group } from './group';
import { PinLike } from './pin-like';


//
// TODO: write tests for this
//
export abstract class BasePin extends Tracker implements PinLike {
  abstract connect(_: PinLike): this;
  abstract observable: Observable<Emission>;

  to(...pins: PinLike[]) {
    pins.forEach(pin => pin.from(this));

    if (pins.length == 1) return pins[0];
    else return group(...pins);
  }

  from(...pins: PinLike[]) {
    pins.forEach(pin => {
      if (pin instanceof Group)
        pin.pins.forEach(p => this.connect(p));
      else
        this.connect(pin);
    });

    if (pins.length == 1) return pins[0];
    else return group(...pins);
  }

  subscribe(observer?: PartialObserver<any>): Subscription;
  subscribe(next?: (value: any) => void, error?: (error: any) => void, complete?: () => void): Subscription;
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
