import { distinctUntilKeyChanged } from "rxjs/operators";

import { emission } from "../shared/emission";
import { KeyMap, KeyFunc, ChangeMap, diff } from "../util/keyed-array-diff";

import { map } from "../pin/map";
import { sink } from "../pin/sink";
import { group } from "../pin/group";
import { value } from "../pin/value";
import { pipe } from "../pin/pipe";
import { PinLike } from "../pin/pin-like";

import { SimpleDeep, DeepAccessor } from "./simple-deep";
import { State, EqualityFunc } from "./state";


export class KeyedDeep extends SimpleDeep {
  private _keyMap: KeyMap = {};

  constructor(state: State, keyfunc: KeyFunc);
  constructor(accessor: DeepAccessor, keyfunc: KeyFunc, compare?: EqualityFunc);
  constructor(stateOrAccessor: State | DeepAccessor, keyfunc: KeyFunc, compare?: EqualityFunc | undefined);

  constructor(stateOrAccessor: State | DeepAccessor, readonly keyfunc: KeyFunc, compare?: EqualityFunc | undefined) {
    super(stateOrAccessor, compare, {
      inputs: ['value'],
      outputs: ['value', 'changes']
    });
  }

  public key(key: string | number): SimpleDeep;
  public key(key: string | number, subkeyfunc: KeyFunc): KeyedDeep;
  public key(key: string | number, subkeyfunc?: KeyFunc): SimpleDeep | KeyedDeep {
    let initialized = false;
    let _this = this;

    this.output; // --> wire output before hand

    let accessor: DeepAccessor = {
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
      bind() { return this.set.subscribe(); },
    }

    if (subkeyfunc) return new KeyedDeep(accessor, subkeyfunc, this.state.compare);
    else return new SimpleDeep(accessor, this.state.compare);
  }

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

  bind() {
    super.bind();
    this.track(this.changes.subscribe());
    return this;
  }

  public get keys() {
    return Object.keys(this._keyMap); 
  }

  public get changes() { return this.out('changes'); }

  protected createOutput(label: string): PinLike {
    if (label === 'changes') {
      return this.state.to(map((value: any, done: (_: ChangeMap) => void) => {
        const result = diff(value, this._keyMap, this.keyfunc);
        this._keyMap = result.newKeyMap;
        done(result.changes);
      }));
    }
    else return super.createOutput(label);
  }
}
