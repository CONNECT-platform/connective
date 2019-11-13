import createRandomTag from "../util/random-tag";
import { emission } from "../shared";

import { PinLike, map, sink, group, Source, filter } from "../pin";

import { Agent } from "./agent";
import { State, EqualityFunc } from "./state";
import { Signature } from "./signature";


export interface DeepAccessor {
  initial: any;
  set: PinLike; 
  get: PinLike;
  bind(): void;
}


export class SimpleDeep extends Agent {
  readonly reemit: Source;
  protected state: State;
  private accessor: DeepAccessor;
  private downPropageteKey: string;

  constructor(state: State);
  constructor(accessor: DeepAccessor, compare?: EqualityFunc);
  constructor(stateOrAccessor: State | DeepAccessor, compare?: EqualityFunc | undefined);
  constructor(stateOrAccessor: State | DeepAccessor, compare?: EqualityFunc | undefined, signature?: Signature);
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

  public sub(index: string | number): SimpleDeep {
    let initialized = false;
    let _this = this;

    return new SimpleDeep({
      initial: _this.value[index],
      get: _this.output.to(map((v: any) => v[index])), 
      set: sink((v, context) => {
        try {
          _this.value[index] = v;
    
          if (initialized) this.reemit.emit(emission(v, context));
          else initialized = true;
        } catch(_) {}
      }),
      bind() { return this.set.subscribe(); },
    }, this.state.compare);
  }

  public get value(): any { return this.state.value; }
  public set value(v: any) { this.state.value = v; }

  get input() { return this.in('value'); }
  get output() { return this.out('value'); }

  bind() {
    if (this.accessor) this.accessor.bind();
    else this.track(this.output.subscribe());
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
