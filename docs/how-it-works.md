# How it works

`expo-shared-element` is a _"primitive"_ that runs shared element transitions entirely native without requiring any passes over the JavaScript bridge. It works by taking in a start- and end node, which are obtained using the `<SharedElement>` component.

Whenever a transition between screens occurs (e.g. performed by a router/navigator), a view in front of the app should be rendered to host the shared element transition. The `position` prop is used to interpolate between the start- and end nodes, `0` meaning "Show the start node" and `1` meaning "Show the end node"

Whenever the `<SharedElementTransition>` component is rendered, it performs the following tasks:

- Measure the size and position of the provided elements
- Obtain the styles of the elements
- Obtain the visual content of the elements (e.g. an image or a view snapshot)
- Render a visual copy of the start element at its current position
- Hide the original elements whenever the visual copies are on the screen
- Monitor the `position` prop and render the shared element transition accordingly
- Upon unmount, unhide the original elements

You typically do not use this component directly, but instead use a Router or Transition-engine which provides a higher-level API.
See [`../Example/src/components/Router.js`](../Example/src/components/Router.js) for an reference implementation of a "simple" stack router implementing
shared element transitions.

The [React Navigation binding](https://github.com/IjzerenHein/react-navigation-shared-element) is another example of a shared element enabled navigator.