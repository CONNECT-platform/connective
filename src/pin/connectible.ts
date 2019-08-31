import { Observable, Subject, defer } from 'rxjs';

import { Emission } from '../shared/emission';

import { BasePin } from './base';
import { PinLike } from './pin-like';

import { PinLockedError } from './errors/locked.error';
import { UnresolvedPinObservableError } from './errors/unresolved-observable.error';


/**
 * 
 * Represents pins that you can connect other pins to.
 * 
 */
export abstract class Connectible extends BasePin {
  private _inbound: PinLike[];
  private _observable: Observable<Emission> | undefined;
  private _resolving = false;
  private _deferred: Subject<Emission> | undefined;
  private _deference_connected = false;

  constructor() {
    super();
    this._inbound = [];
  }

  /**
   *
   * @note it will throw an error if this pin is already locked.
   * You can read more about this [here](https://connective.dev/docs/pin#subscribing-and-binding).
   *
   */
  public connect(pin: PinLike) {
    if (this.locked) throw new PinLockedError();
    if (!this._inbound.includes(pin))
      this._inbound.push(pin);

    return this;
  }

  /**
   * 
   * @note Accessing this property locks the pin.
   * You can read more about this [here](https://connective.dev/docs/pin#subscribing-and-binding).
   * 
   */
  public get observable(): Observable<Emission> {
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

  /**
   * 
   * @note Calling `.clear()` will unlock the pin and disconnect it from
   * all the pins its connected to (removing their references). There is no guarantee
   * that the pin will be usable afterwards.
   * 
   */
  public clear() {
    this._inbound.length = 0;
    this._observable = undefined;
    this._deference_connected = false;

    if (this._deferred) {
      this._deferred.complete();
      this._deferred = undefined;
    }

    return super.clear();
  }

  /**
   * 
   * @returns `true` if the pin is locked, `false` if not.
   * You can read more about this [here](https://connective.dev/docs/pin#subscribing-and-binding).
   * 
   */
  public get locked(): boolean { return this.isLocked(this._observable); }

  /**
   * 
   * @returns `true` if any other pin is connected to this pin, `false` if not.
   * 
   */
  public get connected(): boolean { return this.isConnected(); }

  /**
   * 
   * This method allows child classes to determine the value of `.connected` through
   * other means.
   * 
   */
  protected isConnected(): boolean { return this._inbound.length > 0 }

  /**
   * 
   * Determines if the pin is locked, based on its currently resolved
   * observable.
   * 
   * @param observable
   * 
   */
  protected abstract isLocked(observable: Observable<Emission> | undefined): boolean;

  /**
   * 
   * Determines whether the pin's underlying observable should be resolved, based on
   * inbound connected pins and the currently resolved observable.
   * 
   * @param inbound 
   * @param observable 
   * 
   */
  protected abstract shouldResolve(inbound: PinLike[], observable: Observable<Emission> | undefined): boolean;

  /**
   * 
   * Resolves the pin's underlying observable. This also locks the pin.
   * 
   * @param inbound 
   * 
   */
  protected abstract resolve(inbound: PinLike[]): Observable<Emission>;
}
