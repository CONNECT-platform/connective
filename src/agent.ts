import { Subject, Subscription } from 'rxjs';

import { Input, Output } from './types/io.type';
import { Signal, Control } from './types/control.type';
import { Event } from './types/event.type';

import { _InputImpl } from './impl/input.impl';
import { _OutputImpl } from './impl/output.impl';
import { _SignalImpl } from './impl/signal.impl';
import { _ControlImpl } from './impl/control.impl';


export class Agent {
  private _insub : Subject<Event>;
  private _outsub : Subject<Event>;
  private _sigsub : Subject<Event>;
  private _ctrlsub : Subject<void>;

  private _subs : Subscription;

  constructor() {
    this._insub = new Subject<Event>();
    this._outsub = new Subject<Event>();
    this._sigsub = new Subject<Event>();
    this._ctrlsub = new Subject<void>();

    this._subs = new Subscription();
  }

  public input(tag: string): Input {
    return new _InputImpl(this._insub, tag, sub => this.inputConnected(tag, sub));
  }

  public output(tag: string): Output {
    return new _OutputImpl(this._outsub, tag, sub => this.outputConnected(tag, sub));
  }

  public signal(tag: string): Signal {
    return new _SignalImpl(this._sigsub, tag, sub => this.signalConnected(tag, sub));
  }

  public get control(): Control {
    return new _ControlImpl(this._ctrlsub, sub => this.controlConnected(sub));
  }

  protected inputConnected(_: string, sub: Subscription) {
    this._subs.add(sub);
  }

  protected outputConnected(_: string, sub: Subscription) {
    this._subs.add(sub);
  }

  protected signalConnected(_: string, sub: Subscription) {
    this._subs.add(sub);
  }

  protected controlConnected(sub: Subscription) {
    this._subs.add(sub);
  }
}
