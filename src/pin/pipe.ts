import { merge, OperatorFunction } from 'rxjs';

import { Emission } from '../shared/emission';

import { Pin } from './pin';
import { PinLike } from './pin-like';


export type PipeFunc = OperatorFunction<Emission, Emission>;


/**
 *
 * Represents [pipe](https://connective.dev/docs/pipe) pins.
 *
 */
export class Pipe extends Pin {
  /**
   *
   * The list of pipe functions that constitute this pipe.
   *
   */
  readonly pipes: PipeFunc[];

  constructor(pipes: PipeFunc[]) {
    super();
    this.pipes = pipes;
  }

  /**
   *
   * Resolves the underling observable of the pin, by
   * [mergeing](https://rxjs-dev.firebaseapp.com/api/index/function/merge)
   * observables of inbound pins and piping them through specified
   * [pipeable operators](https://github.com/ReactiveX/rxjs/blob/master/doc/pipeable-operators.md).
   *
   * @param inbound
   *
   */
  protected resolve(inbound: PinLike[]) {
    return this.pipes.reduce(
      (observable, pipe) => observable.pipe(pipe),
        (inbound.length == 1)?
        inbound[0].observable:
        merge(...inbound.map(pin => pin.observable))
      );
  }
}


/**
 *
 * Creates a [pipe](https://connective.dev/docs/pipe) pin using given pipe functions.
 * You can utilize this to use RxJS's pipeable operators in CONNECTIVE flows.
 * [Checkout the docs](https://connective.dev/docs/pipe) for examples and further information.
 *
 * @param pipes
 *
 */
export function pipe(...pipes: PipeFunc[]) { return new Pipe(pipes); }


export default pipe;
