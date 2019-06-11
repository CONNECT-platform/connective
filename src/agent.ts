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

  private _latestOuts : {[out: string]: any};
  private _latestSigs : {[sig: string]: boolean};

  private _ctrl: Control;

  constructor() {
    this._insub = new Subject<Event>();
    this._outsub = new Subject<Event>();
    this._sigsub = new Subject<Event>();
    this._ctrlsub = new Subject<void>();

    this._subs = new Subscription();

    this._latestOuts = {};
    this._latestSigs = {};

    this._subs.add(this._outsub.subscribe(event => this._latestOuts[event.tag] = event.data));
    this._subs.add(this._sigsub.subscribe(event => this._latestSigs[event.tag] = true));
  }

  public input(tag: string): Input {
    return new _InputImpl(this._insub, tag, (sub, pin) => this.inputConnected(tag, sub, pin));
  }

  public output(tag: string): Output {
    return new _OutputImpl(this._outsub, tag, (sub, pin) => this.outputConnected(tag, sub, pin));
  }

  public signal(tag: string): Signal {
    return new _SignalImpl(this._sigsub, tag, (sub, pin) => this.signalConnected(tag, sub, pin));
  }

  public get control(): Control {
    if (!this._ctrl)
      this._ctrl = new _ControlImpl(this._ctrlsub, (sub, pin) => this.controlConnected(sub, pin));
    return this._ctrl;
  }

  protected inputConnected(_: string, sub: Subscription, __: Output) {
    this._subs.add(sub);
  }

  protected outputConnected(tag: string, sub: Subscription, input: Input) {
    this._subs.add(sub);
    if (tag in this._latestOuts) input.receive(this._latestOuts[tag]);
  }

  protected signalConnected(tag: string, sub: Subscription, control: Control) {
    this._subs.add(sub);
    if (tag in this._latestSigs) control.receive();
  }

  protected controlConnected(sub: Subscription, __: Signal) {
    this._subs.add(sub);
  }
}
