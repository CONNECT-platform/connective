export interface Bindable {
  bind(): this;
}


export function isBindable(whatever: any): whatever is Bindable {
  return !!(whatever.bind) && typeof whatever.bind === 'function';
}
