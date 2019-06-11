import { Subject, Subscription } from 'rxjs';

import { Input, Output } from './types/io.type';
import { Event } from './types/event.type';

import { _InputImpl } from './impl/input.impl';
import { _OutputImpl } from './impl/output.impl';


export class Agent {
  private _insub = new Subject<Event>();
  private _outsub = new Subject<Event>();
  private _sigsub = new Subject<Event>();
  private _ctrlsub = new Subject<Event>();

  private _subs = new Subscription();


  public input(tag: string): Input {
    return new _InputImpl(this._insub, tag, this._subs);
  }

  public output(tag: string): Output {
    return new _OutputImpl(this._outsub, tag, this._subs);
  }
}
