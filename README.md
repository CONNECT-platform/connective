<p align="center">
<img src="https://raw.githubusercontent.com/CONNECT-platform/connective/master/logo.svg?sanitize=true" width="320px"/>
</p>

```
npm i @connective.js/core
```

**CONNECTIVE** facilitates large-scale [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming) in Type(Java)Script. It enables intuitive declarative creation of large and complex data-flow graphs and encourages re-use of sub-graphs via abtraction through the concept of 'Agents'.

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

wrap(fromEvent(a, 'input'))
.to(map(() => a.value))
.to(filter(name => name != 'Donald'))
.to(map(name => 'hellow ' + name))
.subscribe(msg => p.innerHTML = msg);
```
[check it on Stackblitz](https://stackblitz.com/edit/connective-hellow-world)
