# Contributing to CONNECTIVE

First of, its so cool of you to contribute to **CONNECTIVE**. We can definitely use more hands on this project,
and more voices always leads to better results.

Here are guidelines on how to contribute based on what kind of contribution you are thinking of:

<br>

## I have feedback

We would love to here it! You can discuss your feedback [here](https://gitter.im/connectv/community).

<br>

## I found a bug ...

### ... and want to report it

1. Search in [the issues section](https://github.com/CONNECT-platform/connective/issues) to ensure it is not already reported.
If in doubt, you could also [simply ask](https://gitter.im/connectv/community).
1. Create an issue 
[using this template](https://github.com/CONNECT-platform/connective/issues/new?template=bug_report.md).
1. If possible, it would be really helpful if you could:
    1. Create an accompanying pull-request, containing a failing test, or ...
    1. Create an independently executable snippet, like on [stackblitz](https://stackblitz.com), and share it


### ... and want to fix it

1. Search in [the issues section](https://github.com/CONNECT-platform/connective/issues) to ensure it is not already
being worked on. When in doubt, you could [simply ask](https://gitter.im/connectv/community).
1. [Report the issue](#-and-want-to-report-it)
1. Create a pull-request, containing:
    1. A test that would fail without your fix being committed,
    1. Your fix.
    1. Make sure rest of the [tests](#testing) are still passing. If they need to change, explain why.


<br>

## I have a [feature] suggestion ...

### ... and want to discuss it

1. Search in [the issues section](https://github.com/CONNECT-platform/connective/issues) to ensure it is not already being discussed.
If in doubt, you could also [simply ask](https://gitter.im/connectv/community).
1. Create an issue
[using this template](https://github.com/CONNECT-platform/connective/issues/new?template=feature_request.md).
1. If possible, it would be really helpful if you could:
    1. Create an accompanying pull-request, containing a failing test, or ...
    1. Create an independently executable snippet, like on [stackblitz](https://stackblitz.com), and share it, or ...
    1. Create a [gist](https://gist.github.com) explaining the difference between what we have now and what do you want to see.

### ... and want to implement it

1. Search in [the issues section](https://github.com/CONNECT-platform/connective/issues) to ensure it is not already being discussed.
If in doubt, you could also [simply ask](https://gitter.im/connectv/community).
1. Discuss it with the community. [Create an issue for it](#-and-want-to-discuss-it), or just [talk with us about it](https://gitter.im/connectv/community).
1. Create a pull-request, containing:
    1. A test that would fail without your feature being committed,
    1. Implementation of your feature,
    1. Make sure rest of the [tests](#testing) are still passing. If they need to change, explain why.

<br>

## I generally want to help

Many thanks! You can:
- Checkout [the issues section](https://github.com/CONNECT-platform/connective/issues)
- Checkout [current priorities](#current-priorities)
- Just give it a try and give us feedback

<br>

## How to run in development

```
> git clone https://github.com/CONNECT-platform/connective.git
> cd connective
> npm i
```

### Testing

For **CONNECTIVE**, tests ARE the specification. They dictate which features the library has and how things behave.
Every bug-fix should in the end accompany a test outlining the bug and ensuring that it is being fixed, every feature
should in the end accompany a test describing the behavior added by the feature.

You can find the tests in these location:
- [All tests](/src/test)
- [Tests specifying shared stuff](/src/shared/test)
- [Tests specifying pins](/src/pin/test)
- [Tests specifying agents](/src/agent/test)

You can run the tests simply using

```
> npm test
```

### Documentation

**CONNECTIVE**'s main documentation is accessible [here](https://connective.dev). It is not a specification, as that role
is delegated to the tests. It is rather a guide on how to use **CONNECTIVE**. It outlines the most important elements
and how to work with them.

The documentation is written in plain HTML using [Nunjucks](https://mozilla.github.io/nunjucks/). The templates rest
[here](/docs/templates).

To build the docs from the templates, simply run this:

```
> npm run docs
```

This will not just build the docs, but also serve a local instance on `http://localhost:3000`. It will also watch for changes
to the templates and rebuild.

## Current Priorities

These are our current contribution priorities, so if you want to help out, helping with one of these would perhaps be the
most helpful:

- Testing and Feedback
- Feedback on [the website](https://connective.dev) and [the docs](https://connective.dev/docs/overview)
- In-code documentation
