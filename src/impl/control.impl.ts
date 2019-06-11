import { Subject, Subscription } from 'rxjs';

import { Signal, Control } from '../types/control.type';


export class _ControlImpl implements Control {

  constructor(
    private _ctrlsub: Subject<void>,
    private _callback?: (_sub: Subscription) => void,
  ) {}

  receive() {
    this._ctrlsub.next();
  }

  connect(signal: Signal): Subscription {
    let _sub = signal.connect(this);
    if (this._callback) this._callback(_sub);

    return _sub;
  }

  get observable() {
    return this._ctrlsub;
  }
}
