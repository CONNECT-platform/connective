import { tap } from 'rxjs/operators';

import { Emission } from '../shared/emission';
import { Bindable } from '../shared/bindable';
import { ContextType } from '../shared/types';

import { Pipe } from './pipe';


export type SinkFunc<T> = (value: T, context: ContextType) => void;


/**
 *
 * Represents [sink](https://connective.dev/docs/sink) pins.
 *
 */
export class Sink<T=unknown> extends Pipe<void, T> implements Bindable {
  private _bound = false;

  constructor(readonly func: SinkFunc<T> = () => {}) {
    super([tap(emission => func(emission.value, emission.context))]);
  }

  /**
   *
   * @returns `true` if this sink is already bound.
   *
   */
  public get bound() { return this._bound; }

  /**
   *
   * Binds this sink if it is not already bound. Binding
   * Basically ensures that the pin is subscribed to and that its side-effect
   * will be enacted.
   *
   */
  bind(): this {
    if (!this._bound) {
      this._bound = true;
      this.track(this.subscribe());
    }

    return this;
  }
}


/**
 *
 * Creates a [sink](https://connective.dev/docs/sink) pin.
 * Sink pins can be used to do something with the data of a flow, outside the scope of the flow
 * (like logging them, etc).
 * [Checkout the docs](https://connective.dev/docs/sink) for examples and further information.
 *
 * @param func
 *
 */
export function sink<T>(func?: SinkFunc<T>) { return new Sink(func); }


export default sink;
