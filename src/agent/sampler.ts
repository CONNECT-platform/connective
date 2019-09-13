import expr from './expr';


/**
 *
 * Creates a [sampler](https://connective.dev/docs/sampler).
 * A sampler passes on the last received value when receiving
 * a signal on its `.control`.
 * [Checkout the docs](https://connective.dev/docs/sampler) for examples and further information.
 *
 */
export function sampler() { return expr((x: any) => x); }