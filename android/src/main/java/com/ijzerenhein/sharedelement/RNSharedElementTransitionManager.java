package com.ijzerenhein.sharedelement;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import android.content.Context;
import android.os.Bundle;
import android.view.View;

import org.unimodules.core.ViewManager;
import org.unimodules.core.arguments.MapArguments;
import org.unimodules.core.arguments.ReadableArguments;
import org.unimodules.core.interfaces.ExpoProp;
import org.unimodules.core.ModuleRegistry;
import org.unimodules.core.interfaces.services.UIManager;

public class RNSharedElementTransitionManager extends ViewManager<RNSharedElementTransition> {
  public static final String VIEW_CLASS_NAME = "RNSharedElementTransition";
  public static final String PROP_START = "startNode";
  public static final String PROP_END = "endNode";
  public static final String PROP_POSITION = "nodePosition";
  public static final String PROP_RESIZE = "resize";
  public static final String PROP_ALIGN = "align";
  public static final String PROP_ANIMATION = "animation";

  private ModuleRegistry mModuleRegistry;

  @Override
  public String getName() {
    return VIEW_CLASS_NAME;
  }

  @Override
  public List<String> getExportedEventNames() {
    return Arrays.asList("onMeasureNode");
  }

  @Override
  public void onCreate(ModuleRegistry moduleRegistry) {
    mModuleRegistry = moduleRegistry;
  }

  @Override
  public RNSharedElementTransition createViewInstance(Context context) {
    RNSharedElementModule module = (RNSharedElementModule) mModuleRegistry.getExportedModule(RNSharedElementModule.NAME);
    return new RNSharedElementTransition(context, module.getNodeManager());
  }

  @Override
  public ViewManagerType getViewManagerType() {
    return ViewManagerType.SIMPLE;
  }

  @Override
  public void onDropViewInstance(RNSharedElementTransition view) {
    super.onDropViewInstance(view);
    view.releaseData();
  }

  @ExpoProp(name = PROP_POSITION)
  public void setNodePosition(RNSharedElementTransition view, final float nodePosition) {
    view.setNodePosition(nodePosition);
  }

  @ExpoProp(name = PROP_ANIMATION)
  public void setAnimation(RNSharedElementTransition view, final int animation) {
    view.setAnimation(RNSharedElementAnimation.values()[animation]);
  }

  @ExpoProp(name = PROP_RESIZE)
  public void setResize(RNSharedElementTransition view, final int resize) {
    view.setResize(RNSharedElementResize.values()[resize]);
  }

  @ExpoProp(name = PROP_ALIGN)
  public void setAlign(RNSharedElementTransition view, final int align) {
    view.setAlign(RNSharedElementAlign.values()[align]);
  }

  private void setViewItem(final RNSharedElementTransition view, final RNSharedElementTransition.Item item, final Map<String, Object> map) {
    if ((map == null) || (mModuleRegistry == null)) return;
    final MapArguments args = new MapArguments(map);
    if (!args.containsKey("node") || !args.containsKey("ancestor")) return;
    final ReadableArguments nodeMap = args.getArguments("node");
    final ReadableArguments ancestorMap = args.getArguments("ancestor");
    final int nodeHandle = nodeMap.getInt("nodeHandle");
    final int ancestorHandle = ancestorMap.getInt("nodeHandle");
    final boolean isParent = nodeMap.getBoolean("isParent");
    final Bundle styleConfig = nodeMap.getArguments("nodeStyle").toBundle();

    final UIManager uiManager = mModuleRegistry.getModule(UIManager.class);
    uiManager.addUIBlock(nodeHandle, new UIManager.UIBlock<View>() {
      @Override
      public void resolve(final View nodeView) {
        uiManager.addUIBlock(ancestorHandle, new UIManager.UIBlock<View>() {
          @Override
          public void resolve(View ancestorView) {
            RNSharedElementNode node = view.getNodeManager().acquire(nodeHandle, nodeView, isParent, ancestorView, styleConfig);
            view.setItemNode(item, node);
          }

          @Override
          public void reject(Throwable throwable) {
            // nop
          }
        }, View.class);
      }

      @Override
      public void reject(Throwable throwable) {
        // nop
      }
    }, View.class);

    // TODO
    /*View nodeView = view.getNodeManager().getNativeViewHierarchyManager().resolveView(nodeHandle);
    View ancestorView = view.getNodeManager().getNativeViewHierarchyManager().resolveView(ancestorHandle);
    RNSharedElementNode node = view.getNodeManager().acquire(nodeHandle, nodeView, isParent, ancestorView, styleConfig);
    view.setItemNode(item, node);*/
  }

  @ExpoProp(name = PROP_START)
  public void setStartNode(final RNSharedElementTransition view, final Map<String, Object> startNode) {
    setViewItem(view, RNSharedElementTransition.Item.START, startNode);
  }

  @ExpoProp(name = PROP_END)
  public void setEndNode(RNSharedElementTransition view, final Map<String, Object> endNode) {
    setViewItem(view, RNSharedElementTransition.Item.END, endNode);
  }
}