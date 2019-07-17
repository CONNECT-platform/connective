import { ContextType } from './types';


export class MergedEmissionContextVal {
  constructor(readonly values: any[]) {}
}


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
            if (ctx[key] == value) return ctx;

            if (ctx[key] instanceof MergedEmissionContextVal) {
              if (value instanceof MergedEmissionContextVal) {
                ctx[key] = new MergedEmissionContextVal(ctx[key].values.concat(
                  value.values.filter(v => !ctx[key].values.includes(v))
                ));
              }
              else {
                if (!ctx[key].values.includes(value))
                  ctx[key].values.push(value);
              }
            }
            else {
              if (value instanceof MergedEmissionContextVal) {
                if (value.values.includes(ctx[key]))
                  ctx[key] = value;
                else
                  ctx[key] = new MergedEmissionContextVal([ctx[key]].concat(value.values));
              }
              else
                ctx[key] = new MergedEmissionContextVal([ctx[key], value]);
            }
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


export function emission(value?: any, context?: ContextType) {
  return new Emission(value, context);
}


export default emission;
