# Google Analytics custom dimensions
angular.module \app.constant, []
.constant \DIMENSIONS, do
  USER_ID: \dimension1
  PERSPECTIVE: \dimension2
  POSITION: \dimension3
  ITEM_CONTENT: \dimension4 # For selections

.constant \ERRORS, do
  NO_ID: \NO_ID               # No ID in path at all.
  NO_ETHERCALC: \NO_ETHERCALC # ethercalc.org/ID not found
  NO_DOC_INFO: \NO_DOC_INFO   # No google doc URL / ID found in ethercalc
  NOT_SHARED: \NOT_SHARED     # Google doc is not shared

.constant \STYLE, do
  LINE_HEIGHT: 24         # Should match $line-height-px in src/sass/app.sass