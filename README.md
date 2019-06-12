<p align="center">  
  <img src="logo.svg?sanitize=true" width="360px"/>
</p>
<br><br>

# CONNECTIVE

**CONNECTIVE** aims to facilitate large-scale [_Reactive_](http://reactivex.io) projects, i.e. projects based on asynchronous interactions between streams of data. It is a library on top of [rxjs](https://github.com/ReactiveX/rxjs), facilitating creation and composition of complex graph flows of observables and data/event streams. It introduces much easier flow design and agent-based programming concepts (like `Agent`s) to avail a much more intuitive interface for proper reactive programming that can scale.

### Does This Apply To What I Am Doing Right Now?

Most probably yes. A LOT of codes people do now-a-days are either web services (backend services), which are asynchronous in nature, or front-end, which are simultaenously multi-agent asynchronous projects. Lots of other applications (such as IoT) also fall in the radar of being asynchronous/multi-agent based in nature. 

If you are not using reactive patterns or half-heartedly just wrestling with callback hells and `async/await`, or sporting either one of the shiny popular front-end frameworks equipped with `VirtualDOM` or some other mechanism for change detection, then you are sacrificing performance to compensate for that departure from the true nature of what you are doing, understandably because it is tough. However, tough or not, waiting for the DB to respond in backend, or any form of `VirtualDOM` in the front-end, will cost you and your project, increasing the response time of your backend, or making your front-end code not really viable on mobile devices, for example.

**CONNECTIVE** is a more intuitive-to-use and scalable interface that builds on top of concepts of rxjs without sacrificing performance. Of course it is still a bit harder to wrap your head around since the essential concepts differ from traditional programming (your logical flow is now a 2 dimensional tree instead of your easy to follow 1 dimensional chain), but it aims at bridging that knowledge gap drastically and making it extremely easy to do extremely reactive logic in extremely complex situations.
