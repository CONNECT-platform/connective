import { Subject, Subscription } from 'rxjs';

import { Signal, Control } from '../types/control.type';


export class _ControlImpl implements Control {

  constructor(
    private _ctrlsub: Subject<void>,
    private _callback?: (sub: Subscription, pin: Signal) => void,
  ) {}

  receive() {
    this._ctrlsub.next();
  }

  connect(signal: Signal): Subscription {
    let _sub = signal.connect(this);
    if (this._callback) this._callback(_sub, signal);

    return _sub;
  }

  get observable() {
    return this._ctrlsub;
  }
}
