import { distinctUntilKeyChanged } from "rxjs/operators";

import { emission } from "../shared/emission";
import { KeyMap, KeyFunc, ChangeMap, diff } from "../util/keyed-array-diff";

import { map } from "../pin/map";
import { sink } from "../pin/sink";
import { group } from "../pin/group";
import { value } from "../pin/value";
import { pipe } from "../pin/pipe";
import { PinLike } from "../pin/pin-like";

import { SimpleDeep, DeepAccessor, DeepChildFactory } from "./simple-deep";
import { State, EqualityFunc } from "./state";
import { TrackCallback } from "../shared/types";


/**
 *
 * Represents a [keyed deep state](https://connective.dev/docs/deep#keyed-deep).
 *
 */
export class KeyedDeep extends SimpleDeep {
  private _keyMap: KeyMap = {};

  constructor(state: State, keyfunc: KeyFunc);
  constructor(accessor: DeepAccessor, keyfunc: KeyFunc, compare?: EqualityFunc);
  constructor(stateOrAccessor: State | DeepAccessor, keyfunc: KeyFunc, compare?: EqualityFunc | undefined);
  /**
   *
   * @param stateOrAccessor underlying state of this deep state or a state tree accessor (for sub-states)
   * @param keyfunc key function to be used to track entities within the state's value
   * @param compare equality function used to detect changes. If state is passed as first argument this is ignored.
   *
   */
  constructor(stateOrAccessor: State | DeepAccessor, readonly keyfunc: KeyFunc, compare?: EqualityFunc | undefined) {
    super(stateOrAccessor, compare, {
      inputs: ['value'],
      outputs: ['value', 'changes']
    });
  }

  public key(key: string | number): SimpleDeep;
  public key<T extends SimpleDeep>(key: string | number, factory: DeepChildFactory<T>): T;
  /**
   *
   * Creates a sub-state bound to entity identified by given key. Entity `x` is
   * said to be identified by key `k` if `state.keyfunc(x) === k`.
   *
   * @param key the identifier of the entity to track
   * @param factory the factory function to be used to construct the sub-state
   *
   */
  public key<T extends SimpleDeep>(key: string | number, factory?: DeepChildFactory<T>): SimpleDeep | T {
    let initialized = false;
    let _this = this;
    let _factory = factory || ((accessor: DeepAccessor, compare: EqualityFunc) => new SimpleDeep(accessor, compare));

    return _factory({
      initial: (_this._keyMap[key] || {item: undefined}).item
              || (Object.values(this.value) || []).find((i: any) => this.keyfunc(i) == key),
      get: group(_this.changes, _this.reemit).to(map(() => (_this._keyMap[key] || {item: undefined}).item)),
      set: sink((v, context) => {
        try {
          let _entry = _this._keyMap[key];
          if (_entry) {
            _entry.item = v;

            if (_this.accessor) {
              _this.value = (Array.isArray(_this.value))?
                                Object.assign([], _this.value, {[_entry.index]: v}):
                                Object.assign({}, _this.value, {[_entry.index]: v});
            }
            else {
              _this.value[_entry.index] = v;

              if (initialized) this.reemit.emit(emission(v, context));
              else initialized = true;
            }
          }
        } catch (err) {}
      }),
      bind(track: TrackCallback) { return track(this.set.subscribe()); },
    }, this.state.compare);
  }

  /**
   *
   * Returns a [pin](https://connective.dev/docs/pin) that reflects the reactive value of
   * the index of entity identified by given key in the state's value. Entity `x` is said
   * to be identified by key `k` if `state.keyfunc(x) === k`.
   *
   * @param key the key to identify target entity with
   *
   */
  public index(key: string | number) {
    let initial: string | number;

    if (this._keyMap[key]) initial = this._keyMap[key].index;
    else initial = ((Object.entries(this.value) || []).find(([index, item]) => this.keyfunc(item) == key)
                    || [-1, undefined])[0];

    return group(
      value(initial),
      group(this.changes, this.reemit).to(map(() => (this._keyMap[key] || {index: -1}).index))
    ).to(pipe(distinctUntilKeyChanged('value')));
  }

  /**
   *
   * Will bind the underlying state, and cause deep change-detection to happen upon
   * changes of the state value. [Read this](https://connective.dev/docs/deep#change-detection)
   * for more information on deep change-detection.
   *
   * If this is a sub-state, also enables up-propagation
   * of state value, causing the parent state to pick up changes made to the value of this
   * sub-state. [Read this](https://connective.dev/docs/deep#two-way-keyed) for more details
   * and examples.
   *
   */
  bind() {
    super.bind();
    this.track(this.changes.subscribe());
    return this;
  }

  /**
   *
   * Keys that entities within the value of the state are identified with. Entity
   * `x` is said to be indetified with key `k` if `state.keyfunc(x) === k`.
   *
   * **WARNING** the keys will not be calculcated unless deep change-detection is active.
   * You can ensure deep change-detection is active by subscribing on `.changes` or
   * calling `.bind()`. [Read this](https://connective.dev/docs/deep#change-detection)
   * for more information on deep change-detection.
   *
   */
  public get keys() {
    return Object.keys(this._keyMap);
  }

  /**
   *
   * A [pin](https://connective.dev/docs/pin) that emits changes to this deep state's list value.
   * These changes include entities being added to the list, removed from it or moved around in it.
   * [Read this](https://connective.dev/docs/deep#change-detection) for more information on 
   * deep change-detection.
   *
   */
  public get changes() { return this.out('changes'); }

  protected createOutput(label: string): PinLike {
    if (label === 'changes') {
      this.output; // --> wire output before hand

      return this.state.to(map((value: any, done: (_: ChangeMap) => void) => {
        const result = diff(value, this._keyMap, this.keyfunc);
        this._keyMap = result.newKeyMap;
        done(result.changes);
      }));
    }
    else return super.createOutput(label);
  }
}
