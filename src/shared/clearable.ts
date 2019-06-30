export interface Clearable {
  clear(): this;
}


//
// TODO: write tests for this.
//
export function isClearable(whatever: any): whatever is Clearable {
  return !!(whatever.clear) && typeof whatever.clear === 'function';
}
