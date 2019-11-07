/**
 *
 * Denotes that this object can (and perhaps should be) bound at some point,
 * using its `.bind()` method.
 *
 */
export interface Bindable {
  bind(): any;
}


/**
 *
 * Checks if given object matches [Bindable](https://connective.dev/docs/interfaces#bindable) interface.
 * Basically checks if `.bind()` method exists.
 *
 * @param whatever
 * @return `true` if `any` is `Bindable`
 *
 */
export function isBindable(whatever: any): whatever is Bindable {
  return !!(whatever.bind) && typeof whatever.bind === 'function';
}