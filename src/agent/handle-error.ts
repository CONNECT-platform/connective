import { retry, tap, share } from 'rxjs/operators';

import emission from '../shared/emission';
import { isEmissionError } from '../shared/errors/emission-error';

import { PinLike } from '../pin/pin-like';
import pin from '../pin/pin';
import group from '../pin/group';
import source, { Source } from '../pin/source';
import pipe from '../pin/pipe';
import { block } from '../pin/filter';

import { Agent } from './agent';


export class HandleError extends Agent {
  private _err: Source;
  private _gate: PinLike;

  constructor() {
    super({
      inputs: ['input'],
      outputs: ['output', 'error'],
    });

    this._err = source();
    this._gate = this.input.to(pipe(
      tap(null, error => {
        if (isEmissionError(error))
          this._err.emit(emission(error, error.emission.context));
        else
          this._err.send(error);
      }),
      retry(),
      share(),
    ));
  }

  protected createOutput(label: string) {
    if (label == 'error')
      return group(this._err, this._gate.to(block())).to(pin());
    else
      return this._gate;
  }

  public clear() {
    this._err.clear();
    return super.clear();
  }

  public get input() { return this.in('input'); }
  public get output() { return this.out('output'); }
  public get error() { return this.out('error'); }
}


export function handleError() { return new HandleError(); }


export default handleError;
