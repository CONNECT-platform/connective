import { Subject, Subscription } from 'rxjs';

import { AbstractPin } from './pin.interface';


export class Source implements AbstractPin {
  private _subject = new Subject<any>();
  private _subs: Subscription | undefined;
  private _inbound: AbstractPin[] = [];

  public send(data?: any) {
    this._subject.next(data);
  }

  public from(pin: AbstractPin) {
    this._inbound.push(pin);
    return this;
  }

  private _from(pin: AbstractPin) {
    if (!this._subs) this._subs = new Subscription();
    this._subs.add(pin.observable.subscribe(this._subject));
  }

  private _resolveInbound() {
    this._inbound.forEach(pin => this._from(pin));
    this._inbound = [];
  }

  public to(pin: AbstractPin) {
    pin.from(this);
    return this;
  }

  clear() {
    if (this._subs) {
      this._inbound = [];
      this._subs.unsubscribe();
      this._subs = undefined;
    }

    return this;
  }

  public get observable() {
    if (this._inbound.length > 0)
      this._resolveInbound();
    return this._subject
  }
}
