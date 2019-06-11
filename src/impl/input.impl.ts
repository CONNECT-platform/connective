import { Subject } from 'rxjs';

import { Input } from '../types/input';
import { Event } from '../types/event';

import { _BaseIOImpl } from './baseio.impl';

export class _InputImpl extends _BaseIOImpl implements Input {

  constructor(
    _insub: Subject<Event>,
    _tag: string,
  ) {
    super(_insub, _tag);
  }

  receive(data: any) {
    this.channel(data);
  }
}
