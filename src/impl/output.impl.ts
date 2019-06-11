import { Subject } from 'rxjs';

import { Output } from '../types/output';
import { Event } from '../types/event';

import { _BaseIOImpl } from './baseio.impl';

export class _OutputImpl extends _BaseIOImpl implements Output {

  constructor(
    _outsub: Subject<Event>,
    _tag: string,
  ) {
    super(_outsub, _tag);
  }

  send(data: any) {
    this.channel(data);
  }
}
