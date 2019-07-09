import { merge, OperatorFunction } from 'rxjs';

import { Emission } from '../shared/emission';

import { Pin } from './pin';
import { PinLike } from './pin-like';


export type PipeFunc = OperatorFunction<Emission, Emission>;


export class Pipe extends Pin {
  readonly pipes: PipeFunc[];

  constructor(pipes: PipeFunc[]) {
    super();
    this.pipes = pipes;
  }

  protected resolve(inbound: PinLike[]) {
    return this.pipes.reduce(
      (observable, pipe) => observable.pipe(pipe),
        (inbound.length == 1)?
        inbound[0].observable:
        merge(...inbound.map(pin => pin.observable))
      );
  }
}


export default function(...pipes: PipeFunc[]) { return new Pipe(pipes); }
