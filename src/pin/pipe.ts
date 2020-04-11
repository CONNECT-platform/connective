import { merge, OperatorFunction, Observable } from 'rxjs';

import { Emission } from '../shared/emission';

import { Pin } from './pin';
import { PinLike } from './pin-like';


export type PipeFunc<I=unknown, O=unknown> = OperatorFunction<Emission<I>, Emission<O>>;


/**
 *
 * Represents [pipe](https://connective.dev/docs/pipe) pins.
 *
 */
export class Pipe<O=unknown, I=unknown> extends Pin<O, I> {
  /**
   *
   * The list of pipe functions that constitute this pipe.
   *
   */
  readonly pipes: PipeFunc<any, any>[];

  constructor(pipes: [PipeFunc<I, O>]);
  constructor(pipes: [PipeFunc<I, unknown>, PipeFunc<unknown, O>]);
  constructor(pipes: [PipeFunc<I, unknown>, ...PipeFunc<unknown, unknown>[]]);
  constructor(pipes: PipeFunc<unknown, unknown>[]) {
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
  protected resolve(inbound: PinLike<I, unknown>[]) {
    return this.pipes.reduce(
      (observable, pipe) => observable.pipe(pipe as any),
        (inbound.length == 1)?
        inbound[0].observable:
        merge(...inbound.map(pin => pin.observable))
      ) as any as Observable<Emission<O>>;
  }
}


export function pipe<I, O>(p: PipeFunc<I, O>): Pipe<O, I>;
export function pipe<I, A, O>(p1: PipeFunc<I, A>, p2: PipeFunc<A, O>): Pipe<O, I>;
export function pipe<I, A, B, O>(p1: PipeFunc<I, A>, p2: PipeFunc<A, B>, p3: PipeFunc<B, O>): Pipe<O, I>;
export function pipe<I, A, B, C, O>(p1: PipeFunc<I, A>, p2: PipeFunc<A, B>, p3: PipeFunc<B, C>, 
  p4: PipeFunc<C, O>): Pipe<O, I>;
export function pipe<I, A, B, C, D, O>(p1: PipeFunc<I, A>, p2: PipeFunc<A, B>, p3: PipeFunc<B, C>, 
  p4: PipeFunc<C, D>, p5: PipeFunc<D, O>): Pipe<O, I>;
export function pipe<I, A, B, C, D, E, O>(p1: PipeFunc<I, A>, p2: PipeFunc<A, B>, p3: PipeFunc<B, C>, 
  p4: PipeFunc<C, D>, p5: PipeFunc<D, E>, p6: PipeFunc<E, O>): Pipe<O, I>;
export function pipe<I, A, B, C, D, E, F, O>(p1: PipeFunc<I, A>, p2: PipeFunc<A, B>, p3: PipeFunc<B, C>, 
  p4: PipeFunc<C, D>, p5: PipeFunc<D, E>, p6: PipeFunc<E, F>, p7: PipeFunc<F, O>): Pipe<O, I>;
/**
 *
 * Creates a [pipe](https://connective.dev/docs/pipe) pin using given pipe functions.
 * You can utilize this to use RxJS's pipeable operators in CONNECTIVE flows.
 * [Checkout the docs](https://connective.dev/docs/pipe) for examples and further information.
 *
 * @param pipes
 *
 */
export function pipe(...pipes: PipeFunc[]) { return new Pipe(pipes as any); }


export default pipe;
