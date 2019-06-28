//
//  RNSharedElementTransitionItem.m
//  react-native-shared-element-transition
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "RNSharedElementTransitionItem.h"

#ifdef DEBUG
#define DebugLog(...) NSLog(__VA_ARGS__)
#else
#define DebugLog(...) (void)0
#endif

@implementation RNSharedElementTransitionItem {
    
    CGRect _visibleLayoutCache;
}
- (instancetype)initWithNodeManager:(RNSharedElementNodeManager*)nodeManager name:(NSString*)name isAncestor:(BOOL)isAncestor
{
    _visibleLayoutCache = CGRectNull;
    _nodeManager = nodeManager;
    _name = name;
    _isAncestor = isAncestor;
    _node = nil;
    _needsLayout = NO;
    _needsContent = NO;
    _content = nil;
    _contentType = RNSharedElementContentTypeNone;
    _style = nil;
    _hidden = NO;
    _hasCalledOnMeasure = NO;
    return self;
}

- (void) setNode:(RNSharedElementNode *)node
{
    if (_node == node) {
        if (node != nil) [_nodeManager release:node];
        return;
    }
    if (_node != nil) {
        if (_hidden) _node.hideRefCount--;
        [_nodeManager release:_node];
    }
    _node = node;
    _needsLayout = node != nil;
    _needsContent = !_isAncestor && (node != nil);
    _content = nil;
    _contentType = RNSharedElementContentTypeNone;
    _style = nil;
    _hidden = NO;
    _hasCalledOnMeasure = NO;
}

- (void) setHidden:(BOOL)hidden
{
    if (_hidden == hidden) return;
    _hidden = hidden;
    if (hidden) {
        _node.hideRefCount++;
    } else {
        _node.hideRefCount--;
    }
}

- (NSString*) contentTypeName
{
    switch(_contentType) {
        case RNSharedElementContentTypeNone: return @"none";
        case RNSharedElementContentTypeRawImage: return @"image";
        case RNSharedElementContentTypeSnapshotView: return @"snapshotView";
        case RNSharedElementContentTypeSnapshotImage: return @"snapshotImage";
        default: return @"unknown";
    }
}

- (CGSize) contentSizeForContent:(id)content contentType:(RNSharedElementContentType)contentType
{
    if (!content || !_style) return CGSizeZero;
    if (contentType != RNSharedElementContentTypeRawImage) return _style.layout.size;
    CGSize size = _style.layout.size;
    return [content isKindOfClass:[UIImage class]] ? ((UIImage*)content).size : size;
}

- (CGRect) contentLayoutForContent:(id)content contentType:(RNSharedElementContentType)contentType
{
    if (!content || !_style) return CGRectZero;
    if (contentType != RNSharedElementContentTypeRawImage) return _style.layout;
    CGSize size = _style.layout.size;
    CGSize contentSize = [self contentSizeForContent:content contentType:contentType];
    CGFloat contentAspectRatio = (contentSize.width / contentSize.height);
    switch (_style.contentMode) {
        case UIViewContentModeScaleToFill: // stretch
            break;
        case UIViewContentModeScaleAspectFit: // contain
            if ((size.width / size.height) < contentAspectRatio) {
                size.height = size.width / contentAspectRatio;
            } else {
                size.width = size.height * contentAspectRatio;
            }
            break;
        case UIViewContentModeScaleAspectFill: // cover
            if ((size.width / size.height) < contentAspectRatio) {
                size.width = size.height * contentAspectRatio;
            } else {
                size.height = size.width / contentAspectRatio;
            }
            break;
        case UIViewContentModeCenter: // center
            size = contentSize;
            break;
        default:
            break;
    }
    CGRect layout = _style.layout;
    layout.origin.x += (layout.size.width - size.width) / 2;
    layout.origin.y += (layout.size.height - size.height) / 2;
    layout.size = size;
    return layout;
}

- (CGRect) visibleLayoutForAncestor:(RNSharedElementTransitionItem*) ancestor
{
    if (!CGRectIsNull(_visibleLayoutCache) || !_style) return _visibleLayoutCache;
    if (!ancestor.style) return _style.layout;

    // Get visible area (some parts may be clipped in a scrollview or something)
    CGRect visibleLayout = _style.layout;
    UIView* superview = _style.view.superview;
    while (superview != nil) {
        CGRect superLayout = [superview convertRect:superview.bounds toView:nil];
        CGRect intersectedLayout = CGRectIntersection(visibleLayout, superLayout);
        if (isinf(intersectedLayout.origin.x) || isinf(intersectedLayout.origin.y)) break;
        visibleLayout = intersectedLayout;
        if (superview == ancestor.style.view) break;
        superview = superview.superview;
    }
    _visibleLayoutCache = visibleLayout;
    return visibleLayout;
}


@end