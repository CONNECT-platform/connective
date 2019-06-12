import { Subject, Subscription } from 'rxjs';

import { AbstractPin } from './pin.interface';


export class Source implements AbstractPin {
  private _subject = new Subject<any>();
  private _subs: Subscription | undefined;

  public send(data?: any) {
    this._subject.next(data);
  }

  public from(pin: AbstractPin) {
    if (!this._subs) this._subs = new Subscription();
    this._subs.add(pin.observable.subscribe(this._subject));
    return this;
  }

  public to(pin: AbstractPin) {
    pin.from(this);
    return this;
  }

  clear() {
    if (this._subs) {
      this._subs.unsubscribe();
      this._subs = undefined;
    }

    return this;
  }

  public get observable() { return this._subject }
}
