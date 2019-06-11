import { Subject, Subscription } from 'rxjs';

import { Input, Output } from '../types/io.type';
import { Event } from '../types/event.type';

import { _BaseIOImpl } from './baseio.impl';


export class _InputImpl extends _BaseIOImpl implements Input {

  constructor(
    _insub: Subject<Event>,
    _tag: string,
    private _ref: Subscription,
  ) {
    super(_insub, _tag);
  }

  receive(data: any) {
    this.channel(data);
  }

  connect(output: Output): Subscription {
    let _sub = output.connect(this);
    this._ref.add(_sub);
    
    return _sub;
  }
}
