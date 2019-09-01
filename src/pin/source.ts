import { Subject, Observable } from 'rxjs';

import { ContextType } from '../shared/types';
import emission, { Emission } from '../shared/emission';

import { PinLike } from './pin-like';
import { Connectible } from './connectible';


/**
 * 
 * Represents [source](https://connective.dev/docs/source) pins.
 * 
 */
export class Source extends Connectible {
  private _subject = new Subject<Emission>();

  /**
   * 
   * This source will send given value, perhaps with given context.
   * Will create a new [emission](https://connective.dev/docs/emission) object.
   * 
   * @param value the value to send
   * @param context the emission context
   * 
   */
  public send(value?: any, context?: ContextType) {
    this.emit(emission(value, context));
  }

  /**
   * 
   * Will emit the given emission object.
   * 
   * @param emission 
   * 
   */
  public emit(emission: Emission) {
    this._subject.next(emission);
  }

  /**
   * 
   * @note this sends a complete notification through-out the flow.
   * Pins that are merely reliant on this source will also be unusable
   * afterwards.
   * 
   */
  clear() {
    this._subject.complete();
    this._subject = new Subject<any>();

    return super.clear();
  }

  /**
   * 
   * Determines if any pin is connected to this pin.
   * 
   */
  protected isConnected() {
    return this.tracking || super.isConnected();
  }

  /**
   * 
   * Resolves the underlying observable of this pin by subscribing the
   * subject of this pin to all inbound pins.
   * 
   * @param inbound 
   * 
   */
  protected resolve(inbound: PinLike[]) {
    inbound.forEach(pin => {
      this.track(pin.observable.subscribe(this._subject));
    });

    inbound.length = 0;
    return this._subject;
  }

  /**
   * 
   * Determines whether this pin is locked. A source is never locked.
   * 
   */
  protected isLocked() { return false; }

  /**
   * 
   * Determines whether should resolve the underlying observable.
   * 
   * @param inbound 
   * @param observable 
   * 
   */
  protected shouldResolve(inbound: PinLike[], observable: Observable<any> | undefined) {
    return inbound.length > 0 || !observable;
  }
}


/**
 * 
 * Creates a [source](https://connective.dev/docs/source) pin.
 * A source pin can be used as the starting point of a reactive flow.
 * [Checkout the docs](https://connective.dev/docs/source) for examples and further information.
 * 
 */
export function source() { return new Source(); }


export default source;
