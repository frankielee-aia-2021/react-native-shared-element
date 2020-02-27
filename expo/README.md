# expo-shared-element

> Native shared element transition _"primitives"_ for react-native 💫

![MagicMoveGif-iOS](../set-ios.gif)
![MagicMoveGif-Android](../set-android.gif)

This library in itself is not a Navigation- or Router library. Instead, it provides a set of comprehensive full native building blocks for performing shared element transitions in Router- or Transition libraries. If you are looking [for the React Navigation binding, you can find it here](https://github.com/IjzerenHein/react-navigation-shared-element).

Read more about the [motivation behind this package and what it tries to solve](./MOTIVATION.md).

### Platform compatibility

| Platform | React Native | Expo SDK | Remarks                        |
| -------- | ------------ | -------- | ------------------------------ |
| iOS      | ✅ 0.59+      | ✅ 35+    | Does not work in iOS Simulator |
| Android  | ✅ 0.59+      | ✅ 35+    |                                |
| Web      | ❌            | ❌        | In progress                    |


## Installation

```
expo install expo-shared-element
```

To use this in a [bare React Native app](https://docs.expo.io/versions/latest/introduction/managed-vs-bare/#bare-workflow), follow the installation instructions.

## Usage

```js
import {
  SharedElement,
  SharedElementTransition,
  nodeFromRef
} from 'expo-shared-element';

// Scene 1
let startAncestor;
let startNode;
<View ref={ref => startAncestor = nodeFromRef(ref)}>
  ...
  <SharedElement onNode={node => startNode = node}>
    <Image style={styles.image} source={...} />
  </SharedElement>
  ...
</View>


// Scene2
let endAncestor;
let endNode;
<View ref={ref => endAncestor = nodeFromRef(ref)}>
  ...
  <SharedElement onNode={node => endNode = node}>
    <Image style={styles.image} source={...} />
  </SharedElement>
  ...
</View>

// Render overlay in front of screen
const position = new Animated.Value(0);
<View style={StyleSheet.absoluteFill}>
  <SharedElementTransition
    start={{
      node: startNode,
      ancestor: startAncestor
    }}
    end={{
      node: endNode,
      ancestor: endAncestor
    }}
    position={position}
    animation='move'
    resize='auto'
    align='auto'
     />
</View>
```

<a class="snack-inline-example-button" href="https://snack.expo.io?platform=android&amp;name=Basic%20Barometer%20usage&amp;sdkVersion=36.0.0&amp;dependencies=expo-sensors&amp;sourceUrl=https%3A%2F%2Fdocs.expo.io%2Fstatic%2Fexamples%2Fv36.0.0%2Fbarometer.js" target="_blank">Try this example on Snack <svg width="14" height="14" viewBox="0 0 16 16" style="margin-left: 5px; vertical-align: -1px;"><g fill="none" stroke="currentColor"><path d="M8.5.5h7v7M8 8L15.071.929M9.07 3.5H1.5v11h11V6.93"></path></g></svg></a>


## API

```js
import { SharedElement, SharedElementTransitions } from 'expo-shared-element';
```

### SharedElement

The `<SharedElement>` component accepts a single child and returns a `node` to it through the `onNode` event handler. The child must correspond to a "real" `View` which exists in the native view hierarchy.

#### Props

| Property        | Type       | Description                                                                          |
| --------------- | ---------- | ------------------------------------------------------------------------------------ |
| `children`      | `element`  | A single child component, which must map to a real view in the native view hierarchy |
| `onNode`        | `function` | Event handler that sets or unsets the node-handle                                    |
| `View props...` |            | Other props supported by View                                                        |

### SharedElementTransition

The `<SharedElementTransition>` component executes a shared element transition natively. It natively performs the following tasks: measure, clone, hide, animate and unhide, to achieve the best results.

#### Props

| Property    | Type                                                       | Description                                                                                                |
| ----------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `start`     | `{ node: SharedElementNode, ancestor: SharedElementNode }` | Start node- and ancestor                                                                                   |
| `end`       | `{ node: SharedElementNode, ancestor: SharedElementNode }` | End node- and ancestor                                                                                     |
| `position`  | `number` \| `Animated.Value` \| `Reanimated.Value`         | Interpolated position (0..1), between the start- and end nodes                                             |
| `animation` | [SharedElementAnimation](#SharedElementAnimation)          | Type of animation, e.g move start element or cross-fade between start- and end elements (default = `move`) |
| `resize`    | [SharedElementResize](#SharedElementResize)                | Resize behavior (default = `auto`)                                                                         |
| `align`     | [SharedElementAlign](#SharedElementAlign)                  | Alignment behavior (default = `auto`)                                                                      |
| `debug`     | `boolean`                                                  | Renders debug overlays for diagnosing measuring and animations                                             |
| `onMeasure` | `function`                                                 | Event handler that is called when nodes have been measured and snapshotted                                 |

### Transitions effects

The transition effect can be controlled using the `animation`, `resize` and `align` props.
In most cases you should leave these to their default values for the best possible results.

If however the start- element and end elements are visually different, then it can make
sense to choose different values. For instance, if you are transitioning from a `<Text>`
with a `white` color to a `<Text>` with a `black` color, then using `animation="fade"` will
create a cross-fade between them.

Another case is when you have a single-line of `<Text>` in the start- view and a full
description in the end- view. A `stretch` effect would in this case not look good, because
the end- element is much larger in size compared the start- element.
In this case you can use `resize="clip"` and `align="left-top"` to create a text reveal effect.

#### SharedElementAnimation

| Animation  | Description                                                                           |
| ---------- | ------------------------------------------------------------------------------------- |
| `move`     | Moves the start- element to the end position                                          |
| `fade`     | Cross-fades between the start- and end elements                                       |
| `fade-in`  | Fade-in the end element coming from the start position (start-element is not visible) |
| `fade-out` | Fade-out the start element to the end position (end-element is not visible)           |

#### SharedElementResize

| Resize    | Description                                                                                                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auto`    | Automatically selects the default resize behavior. For images this will perform the best possible transition based on the `resizeMode` of the image. For other kinds of views, this will default to `stretch`. |
| `stretch` | Stretches the element to the same shape and size of the other element. If the aspect-ratio of the content differs, you may see stretching. In that case consider the `clip` or `none` resize options.          |
| `clip`    | Do not resize, but clip the content to the size of the other content. This option is for instance useful in combination with `<Text>` components, where you want to reveal more text.                          |
| `none`    | Do not resize the content. When combined with `fade`, this creates a plain cross-fade effect without any resizing or clipping                                                                                  |

#### SharedElementAlign

`auto`, `left-center`, `left-top`, `left-right`, `right-center`, `right-top`, `right-right`, `center-top` `center-center`, `center-bottom`

When `auto` is selected, the default alignment strategy is used, which is `center-center`.


## Resources

- The main example & test app is located in [`./Example`](./Example) and serves as an exploration and testing tool. It features a custom stack router which implements the shared element primitives. It also implements the react-navigation binding and serves as a testing tool for that.
- [Simple demo app using RN60 and the react-navigation binding](https://github.com/IjzerenHein/react-navigation-shared-element-rn60demo)