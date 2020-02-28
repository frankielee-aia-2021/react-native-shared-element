# Motivation 

Shared-element transitions add **shine** to your app but can be hard to do in practise.
It's possible to achieve some nice transitions by building custom modals and using the the core `react-native API`, But this also brings with it many restrictions. Things like resizing an image or making sure no _"flicker"_ occurs even an older Android devices can be a real challenge.

This library solves that problem through an all native implementation which is very close to the metal of the OS. It solves the problem by providing a set of _"primitives"_, which don't require any back and forth passes over the react-native bridge. This way, the best possible performance is achieved and better image transitions can be accomplished. The following list is an impression of the kinds of problems that are solved through the native implementation.

- [x] No flickering
- [x] CPU & GPU friendly
- [x] Image resizeMode transitions
- [x] Scrollview clipping
- [x] Border (radius, color, width) transitions
- [x] Background color transitions
- [x] Shadow transitions
- [x] Cross-fade transitions
- [x] Clipping reveal transitions