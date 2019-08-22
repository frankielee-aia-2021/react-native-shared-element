// @flow
import * as React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  StatusBar,
  Platform,
  TouchableOpacity
} from "react-native";
import { Router, NavBar, ListItem, Colors, Heading3 } from "../components";
import { TilesScreen } from "./TilesScreen";
import { TestsScreen } from "./TestsScreen";
import { PagerScreen } from "./PagerScreen";
import { CardScreen } from "./CardScreen";
import { Tests } from "../tests";
import { fadeIn } from "../transitions";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: Platform.select({
    ios: {
      flex: 1,
      backgroundColor: Colors.empty
    },
    android: {
      flex: 1
    }
  }),
  back: {
    color: Colors.blue,
    marginLeft: 20
  }
});

type PropsType = {
  navigation?: any,
  footer?: any
};

export class MainScreen extends React.Component<PropsType> {
  static navigationOptions = {
    title: "React Navigation",
    headerLeft: () => (
      <TouchableOpacity onPress={() => Router.pop()}>
        <Heading3 style={styles.back}>Back</Heading3>
      </TouchableOpacity>
    )
  };

  render() {
    const { footer, navigation } = this.props;
    return (
      <View style={styles.container}>
        {!navigation ? (
          <StatusBar barStyle="dark-content" animated />
        ) : (
          undefined
        )}
        {!navigation ? (
          <NavBar title="Shared Element Demo" back="none" />
        ) : (
          undefined
        )}
        <ScrollView style={styles.content} endFillColor={Colors.empty}>
          <ListItem
            label="Test Cases"
            description="Test cases for development and diagnosing problems"
            onPress={this.onPressTests}
          />
          <ListItem
            label="Tiles Demo"
            description="Image tiles that zoom-in and then allow gestures to paginate and dismiss"
            onPress={this.onPressTilesDemo}
          />
          <ListItem
            label="Card Demo"
            description="Card reveal with shared element transitions"
            onPress={this.onPressCardDemo}
          />
          <ListItem
            label="Card Demo 2"
            description="Heavier card demo with fading gradient overlay and cross-fading texts"
            onPress={this.onPressCardDemo2}
          />
          {footer}
        </ScrollView>
      </View>
    );
  }

  onPressTests = () => {
    const { navigation } = this.props;
    if (navigation) {
      navigation.push("Tests", {
        tests: Tests
      });
    } else {
      Router.push(<TestsScreen tests={Tests} />);
    }
  };

  onPressTilesDemo = () => {
    const { navigation } = this.props;
    if (navigation) {
      navigation.push("Tiles", { type: "tile" });
    } else {
      Router.push(
        <TilesScreen
          type="tile"
          title="Tiles Demo"
          DetailComponent={PagerScreen}
        />
      );
    }
  };

  onPressCardDemo = () => {
    const { navigation } = this.props;
    if (navigation) {
      navigation.push("Tiles", {
        type: "card"
      });
    } else {
      Router.push(
        <TilesScreen
          type="card"
          title="Cards Demo"
          DetailComponent={CardScreen}
        />
      );
    }
  };

  onPressCardDemo2 = () => {
    const { navigation } = this.props;
    if (navigation) {
      navigation.push("Tiles", { type: "card2" });
    } else {
      Router.push(
        <TilesScreen
          type="card2"
          title="Card Demo 2"
          transitionConfig={fadeIn(0, true)}
          DetailComponent={CardScreen}
        />
      );
    }
  };
}
