import { emission } from "../shared";

import { PinLike, map, sink, group, Source } from "../pin";

import { Agent } from "./agent";
import { State, EqualityFunc } from "./state";


export interface DeepAccessor {
  initial: any;
  set: PinLike; 
  get: PinLike;
  bind(): void;
}


export class SimpleDeep extends Agent {
  private state: State;
  private accessor: DeepAccessor;
  readonly reemit: Source;

  constructor(state: State);
  constructor(accessor: DeepAccessor, compare?: EqualityFunc);
  constructor(stateOrAccessor: State | DeepAccessor, compare?: EqualityFunc) {
    super({
      inputs: ['value'],
      outputs: ['value']
    });

    this.reemit = new Source();

    if (stateOrAccessor instanceof State) this.state = stateOrAccessor;
    else {
      this.accessor = stateOrAccessor;
      this.state = new State(this.accessor.initial, compare);
      this.accessor.get.to(this).to(this.accessor.set);
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

  protected createOutput(_: string) {
    this.checkOutput(_);

    return group(
      this.input.to(this.state),
      this.reemit.to(map(() => this.value))
    );
  }

  protected createEntries() { return [this.input] }
  protected createExits() { return [this.output] }
}
