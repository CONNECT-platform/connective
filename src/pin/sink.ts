import { tap } from 'rxjs/operators';

import { Emission } from '../shared/emission';
import { Bindable } from '../shared/bindable';
import { ContextType } from '../shared/types';

import { Pipe } from './pipe';


export type SinkFunc = (value: any, context: ContextType) => void;


export class Sink extends Pipe implements Bindable {
  constructor(readonly func: SinkFunc = () => {}) {
    super([tap((emission: Emission) => func(emission.value, emission.context))]);
  }

  bind(): this {
    this.track(this.subscribe());
    return this;
  }
}


export default function(func?: SinkFunc) { return new Sink(func); }
