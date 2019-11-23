import { KeyFunc } from "../util/keyed-array-diff";

import { State } from "./state";
import { SimpleDeep } from "./simple-deep";
import { KeyedDeep } from "./keyed-deep";


export function deep(state: State): SimpleDeep;
export function deep(state: State, key: KeyFunc): KeyedDeep;
export function deep(state: State, key?: KeyFunc): SimpleDeep | KeyedDeep {
  if (key) return new KeyedDeep(state, key);
  else return new SimpleDeep(state);
}


export default deep;