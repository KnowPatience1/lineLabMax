Let the reshuffling of the index first of all be random. We can use some kind of algorithm later. I need to be able to sort the attributes after they are assigned. We are always starting from the immutable set of numbers and playing with a temporary set of the same numbers in a different order.

I don't understand the reason for set_poolId(), when the poolId is named automatically in save_randomPool()
Great question. In your current flow, you usually do not need `set_poolId` because `save_randomPool` and `load_randomPool` already set it automatically.

Why `set_poolId` still exists:
1. Manual recovery/override:
If state is reset (for example after `generate`, which clears `currentPoolId`), you can reattach view operations to a known pool ID without reloading that pool file.
2. External workflow support:
If you are working with externally managed files/index data, you can force the active `pool_id` context for commands like `save_view`, `load_view`, and `list_views_for_pool`.
3. Debug/testing convenience:
It lets you simulate different pool contexts quickly in Max while testing.

Where this happens in code:
- Auto-set on save: lineBaseSystem.js
- Auto-set on load: lineBaseSystem.js
- Manual set command: lineBaseSystem.js
- Cleared on new generate: lineBaseSystem.js

If you prefer stricter behavior, we can remove `set_poolId` and enforce pool context only from save/load operations.

The co-ordinates are originally all numbers between 0 and 1. In order to be used in a form (sphere, cube), they must be massaged into the number space of that form. For example, a cube requires co-ordinates between -1 and +1.They are at this point already no longer part of the original set of random numbers: they are part of the View definition.
(Cage used very few random numbers in comparison.)
Are there parallels, in this way of working, to evolution? The way the original rands are immutable, as a basis for the processes which continue on top? Or should I be thinking that the rands are also changing when they become too burdensome?
