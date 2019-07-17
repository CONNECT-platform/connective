import { Subject, Observable } from 'rxjs';

import { ContextType } from '../shared/types';
import emission, { Emission } from '../shared/emission';

import { PinLike } from './pin-like';
import { Connectible } from './connectible';


export class Source extends Connectible {
  private _subject = new Subject<Emission>();

  public send(value?: any, context?: ContextType) {
    this.emit(emission(value, context));
  }

  public emit(emission: Emission) {
    this._subject.next(emission);
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


export function source() { return new Source(); }


export default source;
