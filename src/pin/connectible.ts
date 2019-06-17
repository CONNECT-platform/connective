import { Observable, Subscription, Subject, defer } from 'rxjs';

import { BasePin } from './base';
import { PinLike } from './pin-like';

import { PinLockedError } from './errors/locked.error';
import { UnresolvedPinObservableError } from './errors/unresolved-observable.error';


export abstract class Connectible extends BasePin {
  private _inbound: PinLike[];
  private _observable: Observable<any> | undefined;
  private _resolving = false;
  private _sub: Subscription | undefined;
  private _deferred: Subject<any> | undefined;
  private _deference_connected = false;

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
    if (this.shouldResolve(this._inbound, this._observable)) {
      if (this._resolving) {
        if (!this._deferred) {
          this._deferred = new Subject<any>();
        }
        return this._deferred;
      }
      else {
        this._resolving = true;
        this._observable = this.resolve(this._inbound);
        if (this._deferred) {
          let _pristine = this._observable;
          this._observable = defer(() => {
            if (!this._deference_connected) {
              this.track(_pristine.subscribe(this._deferred));
              this._deference_connected = true;
            }

            return _pristine;
          });
        }
        this._resolving = false;
      }
    }

    if (!this._observable) throw new UnresolvedPinObservableError();
    return this._observable;
  }

  public clear() {
    this._inbound = [];
    this._observable = undefined;
    this._deference_connected = false;

    if (this._sub) {
      this._sub.unsubscribe();
      this._sub = undefined;
    }

    if (this._deferred) {
      this._deferred.complete();
      this._deferred = undefined;
    }

    return this;
  }

  protected track(sub: Subscription) : Subscription {
    if (!this._sub) this._sub = new Subscription();
    this._sub.add(sub);
    return sub;
  }

  public get locked(): boolean { return this.isLocked(this._observable); }
  public get connected(): boolean { return this.isConnected(); }

  protected isConnected(): boolean { return this._inbound.length > 0 }

  protected abstract isLocked(observable: Observable<any> | undefined): boolean;
  protected abstract shouldResolve(inbound: PinLike[], observable: Observable<any> | undefined): boolean;
  protected abstract resolve(inbound: PinLike[]): Observable<any>;
}
