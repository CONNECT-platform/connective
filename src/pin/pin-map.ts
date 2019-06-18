import { Subject, Subscription } from 'rxjs';

import { PinLike } from './pin-like';
import { Pin } from './pin';


export type PinMapFactory = (label: string) => PinLike;
export type PinMapSusbcriber = (label: string, pin: PinLike) => void;


export class PinMap {
  private _pins: {[label: string]: PinLike} = {};
  private _subject: Subject<[string, PinLike]>;

  constructor(
    readonly factory: PinMapFactory = () => new Pin()
  ) {}

  public get(label: string): PinLike {
    if (!(label in this._pins)) {
      let _pin = this.factory(label);
      if (this._subject) this._subject.next([label, _pin]);
      return this._pins[label] = _pin;
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
    return this._subject.subscribe(entry => subscriber(...entry));
  }

  public clear(): this {
    this.pins.forEach(pin => pin.clear());
    this._pins = {};

    return this;
  }
}
