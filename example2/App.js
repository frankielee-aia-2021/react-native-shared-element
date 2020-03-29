import { SharedElement, SharedElementTransition, nodeFromRef } from "expo-shared-element";
import * as React from "react";
import { View, StyleSheet, Animated, Dimensions, TouchableOpacity, Image } from "react-native";
export default class App extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            progress: new Animated.Value(0),
            isScene2Visible: false,
            isInProgress: false,
            scene1Ancestor: undefined,
            scene1Node: undefined,
            scene2Ancestor: undefined,
            scene2Node: undefined
        };
        this.onPressNavigate = () => {
            this.setState({ isScene2Visible: true, isInProgress: true });
            Animated.timing(this.state.progress, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true
            }).start(() => this.setState({ isInProgress: false }));
        };
        this.onPressBack = () => {
            this.setState({ isInProgress: true });
            Animated.timing(this.state.progress, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true
            }).start(() => this.setState({ isScene2Visible: false, isInProgress: false }));
        };
        this.onSetScene1Ref = ref => {
            this.setState({ scene1Ancestor: nodeFromRef(ref) });
        };
        this.onSetScene2Ref = ref => {
            this.setState({ scene2Ancestor: nodeFromRef(ref) });
        };
    }
    render() {
        const { state } = this;
        const { width } = Dimensions.get("window");
        return (React.createElement(React.Fragment, null,
            React.createElement(TouchableOpacity, { style: styles.container, activeOpacity: 0.5, onPress: state.isScene2Visible ? this.onPressBack : this.onPressNavigate },
                React.createElement(Animated.View, { style: {
                        ...StyleSheet.absoluteFillObject,
                        transform: [
                            { translateX: Animated.multiply(-200, state.progress) }
                        ]
                    } },
                    React.createElement(View, { style: styles.scene, ref: this.onSetScene1Ref },
                        React.createElement(SharedElement, { onNode: node => this.setState({ scene1Node: node }) },
                            React.createElement(Image, { style: styles.image1, source: require("./logo.png") })))),
                state.isScene2Visible ? (React.createElement(Animated.View, { style: {
                        ...StyleSheet.absoluteFillObject,
                        transform: [
                            {
                                translateX: Animated.multiply(-width, Animated.add(state.progress, -1))
                            }
                        ]
                    } },
                    React.createElement(View, { style: styles.scene2, ref: this.onSetScene2Ref },
                        React.createElement(SharedElement, { onNode: node => this.setState({ scene2Node: node }) },
                            React.createElement(Image, { style: styles.image2, source: require("./logo.png") }))))) : (undefined)),
            state.isInProgress ? (React.createElement(View, { style: styles.sharedElementOverlay, pointerEvents: "none" },
                React.createElement(SharedElementTransition, { start: {
                        node: state.scene1Node,
                        ancestor: state.scene1Ancestor
                    }, end: {
                        node: state.scene2Node,
                        ancestor: state.scene2Ancestor
                    }, position: state.progress, animation: "move", resize: "auto", align: "auto" }))) : (undefined)));
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ecf0f1"
    },
    scene: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center"
    },
    scene2: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#00d8ff",
        justifyContent: "center",
        alignItems: "center"
    },
    image1: {
        resizeMode: "cover",
        width: 160,
        height: 160
        // Images & border-radius have quirks in Expo SDK 35/36
        // Uncomment the next line when SDK 37 has been released
        //borderRadius: 80
    },
    image2: {
        resizeMode: "cover",
        width: 300,
        height: 300,
        borderRadius: 0
    },
    sharedElementOverlay: {
        ...StyleSheet.absoluteFillObject
    }
});
