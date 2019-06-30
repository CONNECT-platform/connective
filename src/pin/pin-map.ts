import { Subject, Subscription } from 'rxjs';

import { Tracker } from '../shared/tracker';

import { PinLike } from './pin-like';
import { Pin } from './pin';


export type PinMapFactory = (label: string) => PinLike;
export type PinMapSusbcriber = (label: string, pin: PinLike) => void;


export class PinMap extends Tracker {
  private _pins: {[label: string]: PinLike} = {};
  private _subject: Subject<[string, PinLike]> | undefined;

  constructor(
    readonly factory: PinMapFactory = () => new Pin()
  ) {
    super();
  }

  public get(label: string): PinLike {
    if (!(label in this._pins)) {
      let _pin = this.factory(label);
      this._pins[label] = _pin;
      if (this._subject) this._subject.next([label, _pin]);
      return _pin;
    }

    return this._pins[label];
  }

  public instantiated(label: string): boolean {
    return label in this._pins;
  }

  public get pins(): PinLike[] {
    return Object.values(this._pins);
  }

  public get entries(): [string, PinLike][] {
    return Object.entries(this._pins);
  }

  public subscribe(subscriber: PinMapSusbcriber): Subscription {
    if (!this._subject)
      this._subject = new Subject<[string, PinLike]>();

    this.entries.forEach(entry => subscriber(...entry));
    return this.track(this._subject.subscribe(entry => subscriber(...entry)));
  }

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
