import control from './control';


/**
 *
 * Creates a [value](https://connective.dev/docs/value) pin. A value
 * pin will emit its value each time all connected pins emit, or emit it
 * per subscription when no pins are connected to it.
 * [Checkout the docs](https://connective.dev/docs/value) for examples and further information.
 *
 * @param val
 *
 */
export function value(val: any) { return control(val); }


export default value;
