import { ContextType } from './types';

/**
 *
 * When the same key appears in multiple [emissions](https://connective.dev/docs/emission),
 * with conflicting values, when the emissions are merged, the corresponding values are
 * stored within an instance of `MergedEmissionContextVal`. You can read these values using
 * `.values` property:
 *
 * ```typescript
 * myFlow.observable.subscribe(emission => {
 *  if (emission.context.someKey instanceof MergedEmissionContextVal)
 *    emission.context.someKey.values.forEach(value => handle(value));
 *  else
 *    handle(emission.context.someKey);
 * });
 * ```
 *
 */
export class MergedEmissionContextVal {
  constructor(readonly values: any[]) {}
}


const _Unset = {};

/**
 *
 * Represents emissions passing through reactive flows.
 * mainly has a `.value` property, which is the value that this emission is wrapping,
 * and `.context` property, which is the context of the emission.
 *
 * [read more here](https://connective.dev/docs/emission).
 *
 */
export class Emission {
  /**
   *
   * @param value the value of the emission
   * @param context the context of the emission
   *
   */
  constructor(
    readonly value: any = undefined,
    readonly context: ContextType = {},
  ) {}

  /**
   *
   * Will create a merged emission from given emissions.
   *
   * @param emissions the emissions to merge
   * @param value the value to set on the forked emission (by default will be an array of the merged emissions' values).
   *
   */
  public static from(emissions: Emission[], value: any = _Unset): Emission {
    return new Emission(
      (value === _Unset)?(emissions.map(emission => emission.value)):(value),
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

  /**
   *
   * Creates a new `Emission` with the same context but the new value
   *
   * @param value
   *
   */
  public fork(value: any): Emission {
    return new Emission(value, this.context);
  }
}


/**
 *
 * Creates an emission with given value and context. You can feed this object to
 * your reactive flows using [`source()`](https://connective.dev/docs/source) for example:
 *
 * ```typescript
 * let a = source();
 * a.emit(emission(42, { reason: 'it is the ultimate answer' }));
 * ```
 *
 * @param value
 * @param context
 */
export function emission(value?: any, context?: ContextType) {
  return new Emission(value, context);
}


export default emission;
