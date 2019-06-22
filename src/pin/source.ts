import { Subject, Observable } from 'rxjs';

import { PinLike } from './pin-like';
import { Connectible } from './connectible';


export class Source extends Connectible {
  private _subject = new Subject<any>();

  public send(data?: any) {
    this._subject.next(data);
  }

  clear() {
    this._subject.complete();
    this._subject = new Subject<any>();

    return super.clear();
  }

  protected isConnected() {
    return this.tracking || super.isConnected();
  }

  protected resolve(inbound: PinLike[]) {
    inbound.forEach(pin => {
      this.track(pin.observable.subscribe(this._subject));
    });

    inbound.length = 0;
    return this._subject;
  }

  protected isLocked() { return false; }
  protected shouldResolve(inbound: PinLike[], observable: Observable<any> | undefined) {
    return inbound.length > 0 || !observable;
  }
}


export default function() { return new Source(); }
