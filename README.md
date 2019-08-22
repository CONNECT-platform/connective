<p align="center">
<img src="https://raw.githubusercontent.com/CONNECT-platform/connective/master/logo.svg?sanitize=true" width="320px"/>
</p>

```
npm i @connectv/core
```
<br>

**CONNECTIVE** facilitates large-scale [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming) in Type(Java)Script. It enables declarative creation of large and complex data/event flows and supports re-use of flows.

Example ([Stackblitz](https://stackblitz.com/edit/connective-hellow-world)):

```typescript
import { wrap, map, filter } from '@connectv/core';
import { fromEvent } from 'rxjs';

let a = document.getElementById('a') as HTMLInputElement;
let p = document.getElementById('p');

//
// Will say hello to everyone but 'Donald'.
// For obvious reasons.
//

wrap(fromEvent(a, 'input'))           // --> wrap the `Observable` in a `Pin`
.to(map(() => a.value))               // --> map the event to value of the input
.to(filter(name => name != 'Donald')) // --> filter 'Donald' out
.to(map(name => 'hellow ' + name))    // --> add 'hellow' to the name
.subscribe(msg => p.innerHTML = msg); // --> write it to the <p> element
```

**CONNECTIVE** is a thin layer on top of [**RxJS**](https://github.com/ReactiveX/rxjs), so it provides all the toolset of **rxjs** by proxy. However, while **RxJS**'s API is better suited for short-lived and small flows, **CONNECTIVE** adds tools better suiting long-living and large/complex flows.

Example ([Stackblitz](https://stackblitz.com/edit/connective-delayed-broadcast)):

```typescript
import { wrap, gate, control, map, pin, pipe, group, spread, sink  } from '@connectv/core';
import { fromEvent } from 'rxjs';
import { delay, debounceTime } from 'rxjs/operators';

let a = document.getElementById('a') as HTMLInputElement;
let p = document.getElementById('p');

let g = gate();                       // --> gate helps us control the flow of the words

wrap(fromEvent(a, 'input'))           // --> wrap the `Observable` in a `Pin`
  .to(pipe(debounceTime(2000)))       // --> debounce for 2 seconds so people are done typing
  .to(map(() => a.value.split(' ')))  // --> map the event to value of input, splitted
  .to(spread())                       // --> spread the array to multiple emissions
  .to(g.input);                       // --> pass those emissions to the gate

group(control(), g.output)            // --> open the gate every time it outputs something (also initially)
  .to(pin())                          // --> this relays either gate output or initial `control()` emit
  .to(pipe(delay(500)))               // --> but wait 500ms before opening the gate
  .to(g.control);                     // --> controls when the gate opens up.

g.output
  .to(sink(() => p.classList.add('faded')))    // --> fade the <p> when something comes out of the gate.
  .to(pipe(delay(100)))                        // --> wait 100 ms
  .to(sink(v => p.innerHTML = v))              // --> write the new word
  .to(sink(() => p.classList.remove('faded'))) // --> show the <p> again
  .subscribe();                                // --> bind everything.
```

# How To Install

Using NPM:

```
npm i @connectv/core
```

Using a CDN:

```
<script src="https://unpkg.com/rxjs/bundles/rxjs.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.14/lodash.min.js"></script>

<script src="https://unpkg.com/@connectv/core/dist/bundles/connective.es5.min.js"></script>
```

# How To Use

Check out the [documentation](https://connective.dev).

# How To Contribute

At current super-early stage of **CONNECTIVE**'s life, one of the best contributions is to simply give feedback on it.
Read the docs, use the library, and drop any feedbacks through one of [these channels](https://connective.dev#contact).


The guideline for technical contribution is being drafted. In the mean-while, clone the code, test it, and read it
to get a better idea of how the code-base works. Do not hesitate to ask any questions that might arise for you.

## Testing

```
npm test
```