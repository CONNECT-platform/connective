import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Event } from '../types/event.type';


export class _BaseIOImpl {
  private _observable: Observable<any>;

  constructor(
    private _sub: Subject<Event>,
    private _tag: string,
  ) {}

  channel(data?: any) {
    if (data) this._sub.next({tag: this._tag, data});
    else this._sub.next({tag: this._tag});
  }

  get observable() {
    if (!this._observable)
      this._observable = this._sub
        .pipe(
          filter(event => event.tag == this._tag),
          map(event => (event as any).data),
        );
    return this._observable;
  }
}
