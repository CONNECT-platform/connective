import { Subject } from 'rxjs';

import { Input } from './types/input';
import { Output } from './types/output';
import { Event } from './types/event';

import { _InputImpl } from './impl/input.impl';
import { _OutputImpl } from './impl/output.impl';


export class Agent {
  private _insub = new Subject<Event>();
  private _outsub = new Subject<Event>();
  private _sigsub = new Subject<Event>();
  private _ctrlsub = new Subject<Event>();

  public input(tag: string): Input {
    return new _InputImpl(this._insub, tag);
  }

  public output(tag: string): Output {
    return new _OutputImpl(this._outsub, tag);
  }
}
