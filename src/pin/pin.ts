import { Observable, merge } from 'rxjs';

import { AbstractPin } from './pin.interface';
import { PinLockedError } from './errors/pinlocked.error';


export class Pin implements AbstractPin {
  private _inbound: AbstractPin[];
  private _observable: Observable<any> | undefined;

  constructor() {
    this._inbound = [];
  }

  public from(pin: AbstractPin) {
    if (this.locked) throw new PinLockedError();
    if (!this._inbound.includes(pin))
      this._inbound.push(pin);

    return this;
  }

  public to(pin: AbstractPin) {
    pin.from(this);
    return this;
  }

  public get observable(): Observable<any> {
    if (!this._observable)
      this._observable = merge(...this._inbound.map(pin => pin.observable));

    return this._observable;
  }

  public clear() {
    this._inbound = [];
    this._observable = undefined;

    return this;
  }

  public get locked(): boolean { return this._observable !== undefined }
}
