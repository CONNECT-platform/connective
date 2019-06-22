import { PinLike } from '../pin/pin-like';
import { Control } from '../pin/control';
import pack from '../pin/pack';
import filter from '../pin/filter';
import map from '../pin/map';

import { OutputNotInSignature } from './errors/signature-mismatch.error';
import { InsufficientInputs } from './errors/insufficient-input.error';

import { Signature } from './signature';
import { Agent } from './agent';


export type NodeInputs = {[input: string]: any};
export type NodeOutput = (out: string, data?: any) => void;
export type NodeError = (error: Error | string) => void;
export type NodeContext = {[key: string]: any};


export interface NodeSignature extends Signature {
  required?: string[];
}


export class Node extends Agent {
  private _context: NodeContext;
  private _control: Control;
  private _res: PinLike;

  constructor(signature: NodeSignature) {
    super(signature);

    this._control = new Control();
    this._res = map((all, callback, error) => {
      if (signature.required && signature.required.some(label => !(label in all[0])))
        error(new InsufficientInputs(signature.required.filter(label => !(label in all[0]))));
      else {
        this.run(all[0], (out: string, data?: any) => {
          if (!this.signature.outputs.includes(out)) {
            error(new OutputNotInSignature(out, this.signature));
          }
          else {
            callback({out, data});
          }
        }, error);
      }
    })
    .from(pack(this.inputs, this._control));
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
    return map((res: any) => res.data)
      .from(
        filter((res: any) => res.out == label)
        .from(this._res)
      )
  }
}
