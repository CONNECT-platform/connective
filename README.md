<p align="center">
<img src="https://raw.githubusercontent.com/CONNECT-platform/connective/master/logo.svg?sanitize=true" width="320px"/>
</p>

```
npm i @connective.js/core
```
<br><br>


**CONNECTIVE** facilitates large-scale [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming) in Type(Java)Script. It enables intuitive declarative creation of large and complex data-flow graphs and encourages re-use of sub-graphs via abtraction through the concept of `Agent`s.

Example:

```typescript
import { wrap, map, filter } from '@connective.js/core';
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
[check it on Stackblitz](https://stackblitz.com/edit/connective-hellow-world)

**CONNECTIVE** itself is a (mostly) thin layer on top of [**rxjs**](https://github.com/ReactiveX/rxjs). It adds:
- Easier creation of complex and large flows by decoupling `Observable` instantiation and flow-description,
- Re-use of flow sub-graphs, so you can easily define parts of your data/event flow in terms of `Agent`s and `Composition`s and re-use them later on.

In other words **CONNECTIVE** allows easier developing and maintaining of complex, large and long-living data/event streams, while **rxjs** excels at small and short-lived streams/flows.
