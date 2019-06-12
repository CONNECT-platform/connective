import { Observable } from 'rxjs';

import { BasePin } from './base';
import { PinLike } from './pin-like';

import { PinLockedError } from './errors/locked.error';
import { UnresolvedPinObservableError } from './errors/unresolved-observable.error';


export abstract class Connectible extends BasePin {
  private _inbound: PinLike[];
  private _observable: Observable<any> | undefined;

  constructor() {
    super();
    this._inbound = [];
  }

  public from(pin: PinLike) {
    if (this.locked) throw new PinLockedError();
    if (!this._inbound.includes(pin))
      this._inbound.push(pin);

    return this;
  }

  public get observable(): Observable<any> {
    if (this.shouldResolveInbound(this._inbound, this._observable))
      this._observable = this.resolveInbound(this._inbound);

    if (!this._observable) throw new UnresolvedPinObservableError();
    return this._observable;
  }

  public clear() {
    this._inbound = [];
    this._observable = undefined;

    return this;
  }

  public get locked(): boolean { return this.isLocked(this._observable); }

  protected abstract isLocked(observable: Observable<any> | undefined): boolean;
  protected abstract shouldResolveInbound(inbound: PinLike[], observable: Observable<any> | undefined): boolean;
  protected abstract resolveInbound(inbound: PinLike[]): Observable<any>;
}
