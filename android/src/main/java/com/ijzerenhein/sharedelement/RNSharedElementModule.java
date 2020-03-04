package com.ijzerenhein.sharedelement;

import android.content.Context;

import org.unimodules.core.ExportedModule;
import org.unimodules.core.Promise;
import org.unimodules.core.interfaces.ExpoMethod;

import java.util.Map;


import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.NativeViewHierarchyManager;

public class RNSharedElementModule extends ExportedModule {
  static final String NAME = "RNSharedElementTransition";

  private RNSharedElementNodeManager mNodeManager;

  public RNSharedElementModule(Context context) {
    super(context);
    mNodeManager = new RNSharedElementNodeManager(context);
  }

  @Override
  public String getName() {
    return NAME;
  }

  RNSharedElementNodeManager getNodeManager() {
    return mNodeManager;
  }

  @ExpoMethod
  public void configure(final Map<String, Object> config, final Promise promise) {

    // Store a reference to the native view manager in the node-manager.
    // This is done so that we can efficiently resolve a view when the
    // start- and end props are set on the Transition view.
    final ReactApplicationContext context = (ReactApplicationContext) getContext();
    final UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
    uiManager.prependUIBlock(new UIBlock() {
      @Override
      public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
        mNodeManager.setNativeViewHierarchyManager(nativeViewHierarchyManager);
      }
    });
  }
}