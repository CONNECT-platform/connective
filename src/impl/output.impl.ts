import { Subject, Subscription } from 'rxjs';

import { Input, Output } from '../types/io.type';
import { Event } from '../types/event.type';

import { _BaseIOImpl } from './baseio.impl';


export class _OutputImpl extends _BaseIOImpl implements Output {

  constructor(
    _outsub: Subject<Event>,
    _tag: string,
    private _callback?: (_sub: Subscription) => void,
  ) {
    super(_outsub, _tag);
  }

  send(data: any) {
    this.channel(data);
  }

  connect(input: Input): Subscription {
    let _sub = this.observable.subscribe(data => input.receive(data));
    if (this._callback) this._callback(_sub);

    return _sub;
  }
}
