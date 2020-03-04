package com.ijzerenhein.sharedelement;

import android.content.Context;

import org.unimodules.core.ExportedModule;
import org.unimodules.core.Promise;
import org.unimodules.core.interfaces.ExpoMethod;

import java.util.Map;

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
    // nop
  }
}