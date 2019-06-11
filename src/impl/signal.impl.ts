import { Subject, Subscription } from 'rxjs';

import { Signal, Control } from '../types/control.type';
import { Event } from '../types/event.type';

import { _BaseIOImpl } from './baseio.impl';


export class _SignalImpl extends _BaseIOImpl implements Signal {

  constructor(
    _signalsub: Subject<Event>,
    _tag: string,
    private _callback?: (_sub: Subscription) => void,
  ) {
    super(_signalsub, _tag);
  }

  send() {
    this.channel();
  }

  connect(control: Control): Subscription {
    let _sub = this.observable.subscribe(() => control.receive());
    if (this._callback) this._callback(_sub);

    return _sub;
  }
}
