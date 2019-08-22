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
export abstract class BasePin extends Tracker implements PinLike {
  abstract connect(_: PinLike): this;
  abstract observable: Observable<Emission>;

  to(...pins: PinLike[]) {
    pins.forEach(pin => pin.from(this));
    return traverseTo(...pins);
  }

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
