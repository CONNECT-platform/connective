<p align="center">  
  <img src="logo.svg?sanitize=true" width="256px"/>
</p>

**CONNECTIVE** is a library that aims to facilitate flow/agent based programming in an extremely fast and performant manner.  it is based on the idea of each _unit_ of the code being assumed an _agent_, which can respond to a multitude of `Observable`s by emitting some other `Observable`s. these inputs and outputs can then be connected to each other, alongside _signal_ s that _agent_ s can send each other to control each other's flow, to create a proper graph-based representation of the flow of the code.
