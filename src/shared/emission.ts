import { ContextType } from './types';


export class MergedEmissionContextVal {
  constructor(readonly values: any[]) {}
}

//
// TODO: add tests for this.
//
export class Emission {
  constructor(
    readonly value: any = undefined,
    readonly context: ContextType = {},
  ) {}

  public static from(emissions: Emission[], value?: any): Emission {
    return new Emission(
      value || emissions.map(emission => emission.value),
      emissions.reduce((ctx, emission) => {
        Object.entries(emission.context).forEach(([key, value]) => {
          if (key in ctx) {
            if (ctx[key] instanceof MergedEmissionContextVal)
              ctx[key].values.push(value);
            else
              ctx[key] = new MergedEmissionContextVal([ctx[key], value]);
          }
          else ctx[key] = value;
        });

        return ctx;
      }, <ContextType>{})
    )
  }

  public fork(value: any): Emission {
    return new Emission(value, this.context);
  }
}


export default function(value?: any, context?: ContextType) {
  return new Emission(value, context);
}
