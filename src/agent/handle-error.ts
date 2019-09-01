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


/**
 * 
 * Represents [handle error](https://connective.dev/docs/handle-error) agents.
 * 
 */
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
    this.checkOutput(label);
    if (label == 'error')
      return group(this._err, this._gate.to(block())).to(pin());
    else
      return this._gate;
  }

  protected createEntries() { return [this.input] }
  protected createExits() { return [this.output, this.error ] }

  public clear() {
    this._err.clear();
    return super.clear();
  }

  /**
   * 
   * Shortcut for `.in('input')`, the input pin receiving values.
   * [Read this](https://connective.dev/docs/handle-error#signature) for more details.
   * 
   */
  public get input() { return this.in('input'); }

  /**
   * 
   * Shortcut for `.out('output')`, which will emit error-free values.
   * [Read this](https://connective.dev/docs/handle-error#signature) for more details.
   * 
   */
  public get output() { return this.out('output'); }

  /**
   * 
   * Shortcut for `.out('error')`, which will emit errors.
   * [Read this](https://connective.dev/docs/handle-error#signature) for more details.
   * 
   */
  public get error() { return this.out('error'); }
}


/**
 * 
 * Creates a [handle error](https://connective.dev/docs/handle-error) agent.
 * Handle error agents will pass on incoming values, but also will catch errors
 * occuring upstream and pass them along, stopping the flow from closing in resposne to such errors.
 * [Checkout the docs](https://connective.dev/docs/handle-error) for examples and further information.
 * 
 */
export function handleError() { return new HandleError(); }


export default handleError;
