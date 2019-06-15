import { combineLatest, of, Observable } from 'rxjs';
import { filter, map, concatMap } from 'rxjs/operators';

import { PinLike } from '../pin/pin-like';
import { Control } from '../pin/control';
import lazy from '../pin/lazy';

import { OutputNotInSignatureError } from './errors/signature-mismatch.error';
import { Signature } from './signature';
import { Agent } from './agent';


export type NodeInputs = {[input: string]: any};
export type NodeOutput = (out: string, data?: any) => void;
export type NodeError = (error: Error | string) => void;
export type NodeContext = {[key: string]: any};


export class Node extends Agent {
  private _context: NodeContext;
  private _control: Control;
  private _res: PinLike;

  constructor(signature: Signature) {
    super(signature);

    this._control = new Control();
    this._res = lazy(() => {
      let _inputs = this.inputs.entries;
      let _observables = _inputs.map(entry => entry[1].observable);
      if (this._control.connected)
        _observables.push(this._control.observable);

      _observables.push(of(true));

      return combineLatest(..._observables)
        .pipe(
          concatMap(data => new Observable(subscriber => {
            this.run(
              _inputs.reduce((_in, entry, index) => {
                _in[entry[0]] = data[index];
                return _in
              }, <NodeInputs>{}),
              (out: string, data?: any) => {
                if (!this.signature.outputs.includes(out)) {
                  subscriber.error(new OutputNotInSignatureError(out, this.signature));
                }
                else {
                  subscriber.next({
                    out: out,
                    data: data
                  });
                  subscriber.complete();
                }
              },
              (error: Error | string) => {
                subscriber.error(error);
              }
            )
          }))
        )
    });
  }

  public get control(): PinLike { return this._control; }

  public with(context: NodeContext): this {
    this._context = context;
    return this;
  }

  protected get context(): NodeContext { return this._context; }

  protected run(
    _: NodeInputs,
    __: NodeOutput,
    ___: NodeError,
  ) {}

  protected createOutput(label: string): PinLike {
    return lazy(() => this._res.observable.pipe(
      filter(res => res.out == label),
      map(res => res.data)
    ));
  }
}
