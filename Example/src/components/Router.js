// @flow
import * as React from "react";
import { StyleSheet, View, Animated, Dimensions } from "react-native";
import { SharedElementTransition } from "react-native-shared-element-transition";
import type { SharedElementNode } from "react-native-shared-element-transition";
import { ScreenTransitionContext } from "./ScreenTransitionContext";
import type { ScreenTransitionContextOnSharedElementsUpdatedEvent } from "./ScreenTransitionContext";
import { PanGestureHandler, State } from "react-native-gesture-handler";

const WIDTH = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  node: {
    ...StyleSheet.absoluteFillObject
  },
  swipeBackOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 20
    //backgroundColor: "green",
    //opacity: 0.2
  }
});

interface RouterProps {
  initialNode: React.Node;
}

type RouterSharedElementConfig =
  //| "auto"
  {
    [key: string]: boolean
  };

interface RouterState {
  stack: React.Node[];
  prevIndex: number;
  nextIndex: number;
  animValue: Animated.Node;
  sharedElementNodes: Array<{
    [string]: SharedElementNode
  }>;
  sharedElementConfig: Array<?RouterSharedElementConfig>;
}

type RouterConfig = {
  sharedElements?: {
    [sharedId: string]: boolean
  }
};

let router;

export class Router extends React.Component<{}, RouterState> {
  _animValue = new Animated.Value(0);
  _swipeBackAnimValue = new Animated.Value(0);
  _onSwipeBackGestureEvent = Animated.event(
    [{ nativeEvent: { x: this._swipeBackAnimValue } }],
    { useNativeDriver: true }
  );

  constructor(props: RouterProps) {
    super(props);
    router = this;
    this.state = {
      stack: [props.initialNode],
      prevIndex: 0,
      nextIndex: 0,
      animValue: Animated.subtract(
        this._animValue,
        Animated.divide(this._swipeBackAnimValue, WIDTH)
      ),
      sharedElementNodes: [],
      sharedElementConfig: [undefined]
    };
  }

  renderSharedElementTransitions() {
    const {
      prevIndex,
      nextIndex,
      stack,
      sharedElementNodes,
      sharedElementConfig,
      animValue
    } = this.state;
    //if (!sharedElementConfig) return;
    if (prevIndex === nextIndex && nextIndex === stack.length - 1) {
      // console.log('renderSharedElementTransitions: null');
      return null;
    }
    const startIndex = Math.min(prevIndex, nextIndex);
    const endIndex = startIndex + 1;
    const config = sharedElementConfig[endIndex];
    if (!config) return;
    const nodes = {};
    for (let sharedId in config) {
      nodes[sharedId] = {
        start: {
          node: sharedElementNodes[startIndex][sharedId],
          ancestor: undefined // TODO
        },
        end: {
          node: sharedElementNodes[endIndex][sharedId],
          ancestor: undefined // TODO
        }
      };
    }
    // console.log('renderSharedElementTransitions: ', nodes);
    const value = Animated.subtract(animValue, startIndex);
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Object.keys(nodes).map(sharedId => (
          // $FlowFixMe
          <SharedElementTransition
            key={`SharedElementTransition.${sharedId}`}
            start={nodes[sharedId].start}
            end={nodes[sharedId].end}
            value={value}
          />
        ))}
      </View>
    );
  }

  renderBackSwiper() {
    const { nextIndex, prevIndex } = this.state;
    if (!nextIndex && !prevIndex) return;
    return (
      <PanGestureHandler
        onGestureEvent={this._onSwipeBackGestureEvent}
        onHandlerStateChange={this._onSwipeBackStateChange}
      >
        <Animated.View style={styles.swipeBackOverlay} collapsable={false} />
      </PanGestureHandler>
    );
  }

  _onSwipeBackStateChange = (event: any) => {
    const { nativeEvent } = event;
    switch (nativeEvent.state) {
      case State.ACTIVE:
        this.setState({
          nextIndex: this.state.nextIndex - 1
        });
        break;
      case State.CANCELLED:
        this.setState({
          nextIndex: this.state.prevIndex
        });
        break;
      case State.END:
        if (nativeEvent.translationX >= WIDTH / 2) {
          Animated.timing(this._swipeBackAnimValue, {
            toValue: WIDTH,
            duration: 100,
            useNativeDriver: true
          }).start(({ finished }) => {
            if (finished) {
              this.pruneStack(this.state.nextIndex + 1);
              this._swipeBackAnimValue.setValue(0);
              this._animValue.setValue(this.state.nextIndex);
            }
          });
        } else {
          Animated.timing(this._swipeBackAnimValue, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true
          }).start(({ finished }) => {
            if (finished) {
              this.setState({
                nextIndex: this.state.prevIndex
              });
            }
          });
        }
        break;
    }
  };

  render() {
    const { stack, animValue } = this.state;
    return (
      <View style={styles.container}>
        {stack.map((node: React.Node, index: number) => (
          <Animated.View
            key={`screen${index}`}
            style={[
              styles.node,
              {
                // $FlowFixMe
                opacity: animValue.interpolate({
                  inputRange: [index - 1, index, index + 1, index + 2],
                  outputRange: [1, 1, 0.5, 0.5]
                }),
                transform: [
                  {
                    // $FlowFixMe
                    translateX: animValue.interpolate({
                      inputRange: [index - 2, index - 1, index, index + 1],
                      outputRange: [WIDTH, WIDTH, 0, 0]
                    })
                  },
                  {
                    // $FlowFixMe
                    scale: animValue.interpolate({
                      inputRange: [index - 1, index, index + 1, index + 2],
                      outputRange: [1, 1, 0.7, 0.7]
                    })
                  }
                ]
              }
            ]}
          >
            <ScreenTransitionContext
              onSharedElementsUpdated={this.onSharedElementsUpdated}
            >
              {node}
            </ScreenTransitionContext>
          </Animated.View>
        ))}
        {this.renderSharedElementTransitions()}
        {this.renderBackSwiper()}
      </View>
    );
  }

  onSharedElementsUpdated = (
    event: ScreenTransitionContextOnSharedElementsUpdatedEvent
  ) => {
    const { stack, sharedElementNodes } = this.state;
    const index = stack.indexOf(event.children);
    if (index < 0) return;
    const newSharedElementNodes = [...sharedElementNodes];
    newSharedElementNodes[index] = event.sharedElementNodes;
    this.setState({
      sharedElementNodes: newSharedElementNodes
    });
  };

  push(node: React.Node, config?: RouterConfig) {
    const {
      stack,
      nextIndex,
      sharedElementNodes,
      sharedElementConfig
    } = this.state;
    this.setState({
      stack: [...stack, node],
      nextIndex: nextIndex + 1,
      sharedElementNodes: [...sharedElementNodes, {}],
      sharedElementConfig: [
        ...sharedElementConfig,
        config && config.sharedElements
      ]
    });
    Animated.timing(this._animValue, {
      toValue: stack.length,
      duration: 400,
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) {
        this.pruneStack(stack.length + 1);
      }
    });
  }

  pop(config?: RouterConfig) {
    const { stack, nextIndex } = this.state;
    if (stack.length <= 1) return;
    this.setState({
      nextIndex: nextIndex - 1
      // TODO UPDATE SHAREDELEMENTCONFIG
    });
    Animated.timing(this._animValue, {
      toValue: stack.length - 2,
      duration: 400,
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) {
        this.pruneStack(stack.length - 1);
      }
    });
  }

  pruneStack(count: number) {
    const {
      stack,
      nextIndex,
      prevIndex,
      sharedElementNodes,
      sharedElementConfig
    } = this.state;
    if (stack.length > count) {
      this.setState({
        stack: stack.slice(0, count),
        sharedElementNodes: sharedElementNodes.slice(0, count),
        sharedElementConfig: sharedElementConfig.slice(0, count),
        prevIndex: nextIndex
      });
    } else if (nextIndex !== prevIndex) {
      this.setState({
        prevIndex: nextIndex
      });
    }
  }

  static push(node: React.Node, config?: RouterConfig) {
    return router.push(node, config);
  }

  static pop(config?: RouterConfig) {
    return router.pop(config);
  }
}