import { Bindable } from '../shared/bindable';

import { Pin } from './pin';


export type SinkFunc = (data: any) => any;


export class Sink extends Pin implements Bindable {
  constructor(readonly func: SinkFunc = () => {}) {
    super();
  }

  bind(): this {
    this.track(this.observable.subscribe(this.func));
    return this;
  }
}


export default function(func?: SinkFunc) { return new Sink(func); }
