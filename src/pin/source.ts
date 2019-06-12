import { Subject, Subscription, Observable } from 'rxjs';

import { PinLike } from './pin-like';
import { Connectible } from './connectible';


export class Source extends Connectible {
  private _subject = new Subject<any>();
  private _subs: Subscription | undefined;

  public send(data?: any) {
    this._subject.next(data);
  }

  clear() {
    if (this._subs) {
      this._subs.unsubscribe();
      this._subs = undefined;
    }

    return super.clear();
  }

  protected resolveInbound(inbound: PinLike[]) {
    inbound.forEach(pin => {
      if (!this._subs)
        this._subs = new Subscription();
      this._subs.add(pin.observable.subscribe(this._subject));
    });

    inbound.length = 0;
    return this._subject;
  }

  protected isLocked() { return false; }
  protected shouldResolveInbound(inbound: PinLike[], observable: Observable<any> | undefined) {
    return inbound.length > 0 || !observable;
  }
}
