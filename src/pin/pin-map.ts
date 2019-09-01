import { Subject, Subscription } from 'rxjs';

import { Tracker } from '../shared/tracker';

import { PinLike } from './pin-like';
import { Pin } from './pin';


export type PinMapFactory = (label: string) => PinLike;
export type PinMapSusbcriber = (label: string, pin: PinLike) => void;


/**
 * 
 * Represents a map of labelled pins. The labelled pins are created
 * first time they are requested, allowing for possibly huge
 * maps without high memory cost.
 * 
 */
export class PinMap extends Tracker {
  private _pins: {[label: string]: PinLike} = {};
  private _subject: Subject<[string, PinLike]> | undefined;

  /**
   * 
   * @param factory will be used to create each new pin.
   * 
   */
  constructor(
    readonly factory: PinMapFactory = () => new Pin()
  ) {
    super();
  }

  /**
   * 
   * Fetches the pin with the given label, and create it if not
   * created already.
   * 
   * @param label 
   * 
   */
  public get(label: string): PinLike {
    if (!(label in this._pins)) {
      let _pin = this.factory(label);
      this._pins[label] = _pin;
      if (this._subject) this._subject.next([label, _pin]);
      return _pin;
    }

    return this._pins[label];
  }

  /**
   * 
   * Checks if a pin with given label is created, without
   * creating the pin.
   * 
   * @param label 
   * 
   */
  public instantiated(label: string): boolean {
    return label in this._pins;
  }

  /**
   * 
   * @returns an array of all created pins.
   * 
   */
  public get pins(): PinLike[] {
    return Object.values(this._pins);
  }

  /**
   * 
   * @returns an entry list (pairs of `[string, Pin]`) of created pins.
   * 
   */
  public get entries(): [string, PinLike][] {
    return Object.entries(this._pins);
  }

  /**
   * 
   * Subscribes to the event of creation of a new pin. The subscriber function
   * will also be invoked on all of the already created pairs.
   * 
   * @param subscriber 
   * @returns a [`Subscription`](https://rxjs-dev.firebaseapp.com/guide/subscription) object
   * that you can later unsubscribe from using `.unsubscribe()`
   * 
   */
  public subscribe(subscriber: PinMapSusbcriber): Subscription {
    if (!this._subject)
      this._subject = new Subject<[string, PinLike]>();

    this.entries.forEach(entry => subscriber(...entry));
    return this.track(this._subject.subscribe(entry => subscriber(...entry)));
  }

  /**
   * 
   * Clears all the created pins and remove references to them,
   * also will remove all subscriptions.
   * 
   */
  public clear(): this {
    this.pins.forEach(pin => pin.clear());
    this._pins = {};

    if (this._subject) {
      this._subject.complete();
      this._subject = undefined;
    }

    return super.clear();
  }
}
