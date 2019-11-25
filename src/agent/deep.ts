import { KeyFunc } from "../util/keyed-array-diff";

import { State } from "./state";
import { SimpleDeep, DeepChildFactory, DeepAccessor } from "./simple-deep";
import { KeyedDeep } from "./keyed-deep";
import { EqualityFunc } from ".";


export function deep(state: State): SimpleDeep;
export function deep(state: State, key: KeyFunc): KeyedDeep;
/**
 *
 * Creates a [deep state](https://connective.dev/docs/deep) from given state.
 * You can track indexes, properties and keyed entities on deep states as bound
 * reactive states.
 * [Checkout the docs](https://connective.dev/docs/deep) for examples and further information.
 *
 * @param state the state to be used as the basis of the returned deep state
 * @param key the key function to be used to track entities in the deep state
 *
 */
export function deep(state: State, key?: KeyFunc): SimpleDeep | KeyedDeep {
  if (key) return new KeyedDeep(state, key);
  else return new SimpleDeep(state);
}


/**
 *
 * Returns a deep child factory that creates [keyed deep](https://connective.dev/docs/deep#keyed-deep) sub-states
 * with given key function. Pass this to `.sub()` or `.key()` on [deep states](https://connective.dev/docs/deep)
 * to have keyed sub-states.
 *
 * @param keyfunc the key function to be used
 *
 */
export function keyed(keyfunc: KeyFunc): DeepChildFactory<KeyedDeep> {
  return (accessor: DeepAccessor, compare: EqualityFunc) => new KeyedDeep(accessor, keyfunc, compare);
}


export default deep;