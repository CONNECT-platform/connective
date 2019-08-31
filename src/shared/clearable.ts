/**
 * 
 * Denotes that this object can (and perhaps should be) cleared at some point,
 * using its `.clear()` method.
 * 
 */
export interface Clearable {
  clear(): this;
}


/**
 * 
 * Checks if given object matches [Clearable](https://connective.dev/docs/interfaces#clearable) interface.
 * Basically checks if `.clear()` method exists.
 * 
 * @param whatever 
 * @return `true` if `any` is `Clerable`
 * 
 */
export function isClearable(whatever: any): whatever is Clearable {
  return !!(whatever.clear) && typeof whatever.clear === 'function';
}