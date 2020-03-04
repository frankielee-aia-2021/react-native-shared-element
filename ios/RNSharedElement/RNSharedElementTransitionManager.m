//
//  RNSharedElementTransitionManager.m
//  react-native-shared-element
//

#import <UMCore/UMModuleRegistryConsumer.h>
//#import <UMReactNativeAdapter/UMReactNativeAdapter.h>
//#import <UMReactNativeAdapter/UMBridgeModule.h>
#import <UMCore/UMUIManager.h>
//#import <React/RCTBridge.h>
//#import <React/RCTUIManager.h>
#import "RNSharedElementTransitionManager.h"
#import "RNSharedElementTransition.h"
#import "RNSharedElementNodeManager.h"
#import "RNSharedElementTypes.h"

@interface RNSharedElementTransitionManager ()

@property (nonatomic, strong) RNSharedElementNodeManager *nodeManager;
@property (nonatomic, weak) UMModuleRegistry *moduleRegistry;
//@property (nonatomic, weak) UMReactNativeAdapter *rnAdapter;

@end

@implementation RNSharedElementTransitionManager

UM_EXPORT_MODULE(RNSharedElementTransition);

- (instancetype) init
{
  if ((self = [super init])) {
    _nodeManager = [[RNSharedElementNodeManager alloc]init];
  }
  return self;
}

- (NSString *)viewName
{
  return @"RNSharedElementTransition";
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[
    @"onMeasureNode"
  ];
}

- (UIView *)view
{
  return [[RNSharedElementTransition alloc] initWithNodeManager:_nodeManager];
}

- (void)setModuleRegistry:(UMModuleRegistry *)moduleRegistry
{
  _moduleRegistry = moduleRegistry;
  
  // Access to the bridge is required in order to convert node-handles into UIViews.
  // Search for the internal UMReactNativeAdapter and store its ref for later use.
  //_rnAdapter = (UMReactNativeAdapter *) [_moduleRegistry getModuleImplementingProtocol:@protocol(UMUIManager)];
}

/*- (UIView *)viewForNodeHandle:(NSObject *) nodeHandle
 {
 if (![nodeHandle isKindOfClass:[NSNumber class]]) return nil;
 if ((_rnAdapter == nil) || (_rnAdapter.bridge == nil) || (_rnAdapter.bridge.uiManager == nil)) return nil;
 NSNumber* reactTag = (NSNumber *) nodeHandle;
 return [_rnAdapter.bridge.uiManager viewForReactTag:reactTag];
 }
 
 - (RNSharedElementNode*) nodeFromJson:(NSDictionary*)json
 {
 if (json == nil) return nil;
 NSObject* nodeHandle = [json valueForKey:@"nodeHandle"];
 NSNumber* isParent =[json valueForKey:@"isParent"];
 UIView *sourceView = [self viewForNodeHandle:nodeHandle];
 return (sourceView != nil)
 ? [_nodeManager acquire:(NSNumber *) nodeHandle view:sourceView isParent:[isParent boolValue]]
 : nil;
 }
 
 - (void) nodeFromJSON:(NSDictionary*)json completion:(void (^)(RNSharedElementNode*))completion
 {
 RNSharedElementNode *node = [self nodeFromJson:json];
 completion(node);
 }*/


- (void) nodeFromJSON:(NSDictionary*)json completion:(void (^)(RNSharedElementNode *))completion
{
  if (json == nil) {
    completion(nil);
    return;
  }
  NSObject* nodeHandle = [json valueForKey:@"nodeHandle"];
  NSNumber* isParent =[json valueForKey:@"isParent"];
  [[_moduleRegistry getModuleImplementingProtocol:@protocol(UMUIManager)] executeUIBlock:^(id view) {
    RNSharedElementNode *node = view ? [self->_nodeManager acquire:(NSNumber *) nodeHandle view:view isParent:[isParent boolValue]] : nil;
    completion(node);
  } forView:nodeHandle ofClass:[UIView class]];
}

UM_VIEW_PROPERTY_ANIMATED(nodePosition, NSNumber *, RNSharedElementTransition, nodePosition, CGFloat)
{
  view.nodePosition = value.doubleValue;
}

UM_VIEW_PROPERTY(animation, NSNumber *, RNSharedElementTransition)
{
  view.animation = value.integerValue;
}

UM_VIEW_PROPERTY(resize, NSNumber *, RNSharedElementTransition)
{
  view.resize = value.integerValue;
}

UM_VIEW_PROPERTY(align, NSNumber *, RNSharedElementTransition)
{
  view.align = value.integerValue;
}

UM_VIEW_PROPERTY(startNode, NSDictionary *, RNSharedElementTransition)
{
  [self nodeFromJSON:[value valueForKey:@"node"] completion:^(RNSharedElementNode *node) {
    view.startNode = node;
  }];
  [self nodeFromJSON:[value valueForKey:@"ancestor"] completion:^(RNSharedElementNode *node) {
    view.startAncestor = node;
  }];
}

UM_VIEW_PROPERTY(endNode, NSDictionary *, RNSharedElementTransition)
{
  [self nodeFromJSON:[value valueForKey:@"node"] completion:^(RNSharedElementNode *node) {
    view.endNode = node;
  }];
  [self nodeFromJSON:[value valueForKey:@"ancestor"] completion:^(RNSharedElementNode *node) {
    view.endAncestor = node;
  }];
}

UM_EXPORT_METHOD_AS(configure,
                    config:(NSDictionary *)config
                    resolver:(UMPromiseResolveBlock)resolve
                    rejecter:(UMPromiseRejectBlock)reject)
{
  NSArray* imageResolvers = [config valueForKey:@"imageResolvers"];
  if (imageResolvers != nil) {
    [RNSharedElementNode setImageResolvers:imageResolvers];
  }
  resolve(@(YES));
}

@end
