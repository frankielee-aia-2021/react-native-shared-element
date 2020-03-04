import { requireNativeViewManager, NativeModulesProxy } from "@unimodules/core";

const isAvailable = !!NativeModulesProxy.RNSharedElementTransition;

if (isAvailable) {
  NativeModulesProxy.RNSharedElementTransition.configure({
    imageResolvers: [
      "RNPhotoView.MWTapDetectingImageView" // react-native-photo-view
    ].map(path => path.split("."))
  });
}

export const RNSharedElementTransitionView = isAvailable
  ? requireNativeViewManager("RNSharedElementTransition")
  : undefined;
