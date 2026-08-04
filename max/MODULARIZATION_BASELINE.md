# lineBaseSystem Modularization Baseline (Step 1)

Date: 2026-08-04
Scope: Freeze behavior before splitting `max/lineBaseSystem.js`.

## 1) Command Surface Freeze

Public command names, arguments, and outlet message names are frozen to the header contract in `max/lineBaseSystem.js`.

Rules during modularization:
- Do not rename commands.
- Do not change command argument order.
- Do not rename outlet message names.
- Do not change acknowledgement payload shapes.

## 2) Runtime Invariants Freeze

These invariants must remain true after every extraction step:
- `randomPool` remains immutable once generated/loaded.
- `generate`, `load_randomPool`, `load_view`, and `rebuild_from_loaded_pool` keep current reset/rebuild behavior.
- Sorting/reshuffle override precedence remains unchanged.
- Visibility/hierarchy/render output ordering remains unchanged.
- Transform commands keep local/world semantics and existing outlet rows.

## 3) Golden Acknowledgement/Report Outlets

Verify these outlet events still fire with same payload shape:
- `rendered lineCount`
- `architecture layerCount groupCount lineCount`
- `architecture_rows_begin`
- `architecture_rows_end rowCount`
- `pathName nameValue`
- `pool_id idValue`
- `rebuilt_from_loaded_pool poolId lineCount`
- `index_saved indexPath poolCount viewCount`
- `index_loaded indexPath poolCount viewCount`
- `index_cache_cleared previousPath hadCache`
- `view_registered viewId viewPath poolId indexPath`
- `view_unregistered viewId removedCount indexPath`
- `randomPool_saved fullPath poolId`
- `randomPool_loaded sourcePath poolId lineCount`
- `view_saved fullPath viewId poolId`
- `view_loaded sourcePath viewId poolId`
- `hierarchy_begin ...` and `hierarchy_end`
- `reshuffle_all_applied lineCount randomCount`
- `sort_all_numbers_applied direction lineCount randomCount`
- `sort_set ...`
- `sort_applied`
- `sort_reset`
- `sort_state ...`
- `sort_rows_begin`
- `sort_rows_end rowCount`
- `menus_cleared`

## 4) Parity Test Matrix (Manual in Max)

Run this matrix after each module extraction slice.

### A. Generate / Rebuild
- `generate 120`
- `architecture`
- `reportHierarchy`
- `reportArchitectureRows`

Expect:
- scene renders
- `architecture` counts are non-zero
- hierarchy begin/end stream is valid
- rows begin/end stream is valid

### B. Reshuffle / Sort
- `reshuffleLines`
- `reshuffleCoords`
- `reshuffleAll`
- `sortAllNumbers asc`
- `sortAllNumbers desc`

Expect:
- command works without errors
- corresponding acknowledgement outlet payloads unchanged
- visual rerender happens for non-noop operations

### C. Sort State API
- `getSortState`
- `setSortCoords x asc 1`
- `setSortColors rgba desc 0.5`
- `setSortWidth desc 1`
- `reportSortRows`
- `applySort`
- `resetSort`

Expect:
- sort_set/sort_state/sort_rows/sort_applied/sort_reset unchanged
- `applySort` with fully zeroed state keeps current optimized no-redraw behavior

### D. Visibility / Selection / Menus
- `setVisible layer a1 0`
- `setVisible group g1 1`
- `setVisible line 1 1`
- `show layer a1`
- `hide group g1`
- `refreshMenus`
- `clearMenus`

Expect:
- visibility and rerender behavior unchanged
- menu/current selection outlet behavior unchanged

### E. Persistence / Index
- `set_pathName <folder>`
- `save_randomPool`
- `load_randomPool <poolFile>`
- `save_view view_001`
- `load_view <viewFile>`
- `save_index`
- `load_index`
- `register_view view_001 <viewFile>`
- `unregister_view view_001`

Expect:
- save/load/index acknowledgements unchanged
- view payload still includes transform and sort persistence fields

### F. Transforms
- scene, layer, and group set/get/reset/report commands

Expect:
- transform_set/reset/space_set and row streams unchanged
- render output remains consistent with transforms

## 5) Extraction Gate Per Slice

For each modularization slice, pass all gates before proceeding:
1. `node --check max/lineBaseSystem.js`
2. Editor diagnostics clean for edited files
3. Run matrix sections touched by the slice
4. Verify acknowledgement payload names and argument counts

If any gate fails:
- stop extraction,
- revert only that slice,
- fix and re-run gates.

## 6) Efficient Parity Harness (Fast Loop + Full Checkpoint)

Use this workflow for faster, reliable parity checks while extracting small slices.

### A. Fast Loop (run after every small slice)

Run only these checks unless the slice touches a different subsystem:
- `node --check max/lineBaseSystem.js`
- `node --check max/lineBaseUtils.js`
- `node --check max/lineBaseValidators.js`
- Editor diagnostics clean for all edited files

Then run this compact command stream in Max:
- `generate 120`
- `architecture`
- `reportHierarchy`
- `reshuffleAll`
- `sortAllNumbers asc`
- `setSortCoords x asc 1`
- `setSortColors rgba desc 0.5`
- `setSortWidth desc 1`
- `applySort`
- `getSortState`
- `reportSortRows`
- `set_pathName <test-folder>`
- `save_randomPool`
- `save_view parity_view_001`
- `save_index`
- `load_index`

Pass criteria:
- no command errors
- expected ack/report names still emitted
- payload shapes/argument counts unchanged

### B. Full Checkpoint (run every 3 slices or before merge)

Run the full matrix in section 4.

### C. Golden Outlet Transcript Method

To avoid visual-only regressions, keep one baseline outlet transcript and diff against it.

Capture only stable ack/report lines, including:
- `architecture`
- `architecture_rows_begin`
- `architecture_rows_end`
- `hierarchy_begin`
- `hierarchy_end`
- `reshuffle_all_applied`
- `sort_all_numbers_applied`
- `sort_set`
- `sort_applied`
- `sort_reset`
- `sort_state`
- `sort_rows_begin`
- `sort_rows_end`
- `index_saved`
- `index_loaded`
- `view_saved`
- `randomPool_saved`
- `rendered`

Normalize before diffing:
- strip timestamps
- strip absolute paths
- ignore IDs known to vary run-to-run (if any)

If normalized diff is empty, parity passes for that slice.
