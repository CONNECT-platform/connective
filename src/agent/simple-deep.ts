import createRandomTag from "../util/random-tag";
import { emission } from "../shared/emission";

import { map } from "../pin/map";
import { sink } from "../pin/sink";
import { group } from "../pin/group";
import { filter } from "../pin/filter";
import { Source } from "../pin/source";
import { PinLike } from "../pin/pin-like";

import { Agent } from "./agent";
import { State, EqualityFunc } from "./state";
import { Signature } from "./signature";


export interface DeepAccessor {
  initial: any;
  set: PinLike;
  get: PinLike;
  bind(): void;
}


export type DeepChildFactory<T extends SimpleDeep> = (accessor: DeepAccessor, compare: EqualityFunc) => T;

/**
 *
 * Represents non-keyed (simple) [deep states](https://connective.dev/docs/deep).
 *
 */
export class SimpleDeep extends Agent {
  /**
   *
   * can be used to force re-emission of state value.
   *
   */
  readonly reemit: Source;

  protected state: State;
  protected accessor: DeepAccessor;
  private downPropageteKey: string;
  private bound = false;

  constructor(state: State);
  constructor(accessor: DeepAccessor, compare?: EqualityFunc);
  constructor(stateOrAccessor: State | DeepAccessor, compare?: EqualityFunc | undefined);
  constructor(stateOrAccessor: State | DeepAccessor, compare?: EqualityFunc | undefined, signature?: Signature);
  /**
   *
   * @param stateOrAccessor underlying state of this deep state or a state tree accessor (for sub-states)
   * @param compare equality function used to detect changes. If state is passed as first argument this is ignored.
   * @param signature the signature of the state, to be overriden by child classes.
   *
   */
  constructor(stateOrAccessor: State | DeepAccessor, compare?: EqualityFunc | undefined, signature?: Signature) {
    super(signature || {
      inputs: ['value'],
      outputs: ['value']
    });

    this.reemit = new Source();
    this.downPropageteKey = createRandomTag();

    if (stateOrAccessor instanceof State) this.state = stateOrAccessor;
    else {
      this.accessor = stateOrAccessor;
      this.state = new State(this.accessor.initial, compare);
      this.accessor.get
        .to(map((_, done, __, context) => {
          context[this.downPropageteKey] = true;
          done(_);
        }))
        .to(this)
        .to(filter((_, done, __, context) => {
          const downPropagated = context[this.downPropageteKey];
          delete context[this.downPropageteKey];
          done(!downPropagated);
        }))
        .to(this.accessor.set);
    }
  }

  public sub(index: string | number): SimpleDeep;
  public sub<T extends SimpleDeep>(index: string | number, factory: DeepChildFactory<T>): T;
  /**
   *
   * Creates a sub-state for given index/property.
   * [Read this](https://connective.dev/docs/deep) for more details
   *
   * @param index
   * @param factory the factory function to be used to construct the sub-state
   *
   */
  public sub<T extends SimpleDeep>(index: string | number, factory?: DeepChildFactory<T>): SimpleDeep | T {
    let initialized = false;
    let _this = this;
    let _factory = factory || ((accessor: DeepAccessor, compare: EqualityFunc) => new SimpleDeep(accessor, compare));

    return _factory({
      initial: (_this.value || [])[index],
      get: _this.output.to(map((v: any) => (v || [])[index])),
      set: sink((v, context) => {
        try {
          if (!_this.value) _this.value = [];

          if (this.accessor) {
            _this.value = (Array.isArray(_this.value))?
                          Object.assign([], _this.value, {[index]: v}):
                          Object.assign({}, _this.value, {[index]: v});
          }
          else {
            _this.value[index] = v;
    
            if (initialized) this.reemit.emit(emission(v, context));
            else initialized = true;
          }
        } catch(_) {}
      }),
      bind() { return this.set.subscribe(); },
    }, this.state.compare);
  }

  /**
   *
   * Allows reading or updating state's value directly.
   *
   */
  public get value(): any { return this.state.value; }
  public set value(v: any) { this.state.value = v; }

  /**
   *
   * The equality function used by this deep state. Is used for change detection.
   *
   */
  public get compare() { return this.state.compare; }

  /**
   *
   * Shortcut for `.in('value')`, on which the state receives new values.
   * [Read this](https://connective.dev/docs/state#signature) for more details.
   *
   */
  get input() { return this.in('value'); }

  /**
   *
   * Shortcut for `.out('value')`, on which the state emits new values.
   * [Read this](https://connective.dev/docs/state#signature) for more details.
   *
   */
  get output() { return this.out('value'); }

  /**
   *
   * Binds the underlying state. If this is a sub-state, it will also
   * allow up-propagation of state value, causing the parent state to pick up
   * changes made to the value of this sub-state. [Read this](https://connective.dev/docs/deep#two-way-data)
   * for more details and examples.
   *
   */
  bind() {
    if (!this.bound) {
      if (this.accessor) this.accessor.bind();
      else this.track(this.output.subscribe());
      this.bound = true;
    }
    return this;
  }

  protected createOutput(_: string): PinLike {
    this.checkOutput(_);

    return group(
      this.input.to(this.state),
      this.reemit.to(map(() => this.value))
    );
  }

  protected createEntries() { return [this.input] }
  protected createExits() { return [this.output] }
}
