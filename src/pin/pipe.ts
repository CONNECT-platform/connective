import { merge, OperatorFunction } from 'rxjs';

import { Pin } from './pin';


export type PipeFunc = OperatorFunction<any, unknown>;


export class Pipe extends Pin {
  readonly pipes: PipeFunc[];

  constructor(...pipes: PipeFunc[]) {
    super();
    this.pipes = pipes;
  }

  protected resolve(inbound: Pin[]) {
    return this.pipes.reduce(
      (observable, pipe) => observable.pipe(pipe),
      merge(...inbound.map(pin => pin.observable)));
  }
}


export default function(...pipes: PipeFunc[]) { return new Pipe(...pipes); }
