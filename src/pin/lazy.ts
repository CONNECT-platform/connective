import { Observable } from 'rxjs';

import { PinLockedError } from './errors/locked.error';
import { PinLike } from './pin-like';


export type LazyObservable<T> = () => Observable<T>;

class Lazy implements PinLike {
  private _observable: Observable<any> | undefined;

  constructor(private _lazy: LazyObservable<any>) {}

  from(_: PinLike): this {
    throw new PinLockedError();
  }

  to(pin: PinLike) {
    pin.from(this);
    return this;
  }

  clear() {
    this._observable = undefined;
    return this;
  }

  public get observable(): Observable<any> {
    if (!this._observable)
      this._observable = this._lazy();

    return this._observable;
  }
}

export default function(lazy: LazyObservable<any>) { return new Lazy(lazy); }
