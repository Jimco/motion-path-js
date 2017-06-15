/* global internalScope */
'use strict';

(function () {
  function hypotenuseLength (a, b) {
    return Math.sqrt(a * a + b * b);
  }

  function getRayLength (size, containerWidth, containerHeight, offsetPosX, offsetPosY) {
    var distRight = Math.abs(containerWidth - offsetPosX);
    var distBottom = Math.abs(containerHeight - offsetPosY);
    var distLeft = Math.abs(offsetPosX);
    var distTop = Math.abs(offsetPosY);

    if (size === 'closest-side') {
      return Math.min(distLeft, distTop, distRight, distBottom);
    } else if (size === 'farthest-side') {
      return Math.max(distLeft, distTop, distRight, distBottom);
    }

    var distTopLeft = hypotenuseLength(distLeft, distTop);
    var distTopRightCorner = hypotenuseLength(distRight, distTop);
    var distBottomLeftCorner = hypotenuseLength(distLeft, distBottom);
    var distBottomRightCorner = hypotenuseLength(distRight, distBottom);

    if (size === 'closest-corner') {
      return Math.min(distTopLeft, distTopRightCorner, distBottomLeftCorner, distBottomRightCorner);
    } else if (size === 'farthest-corner') {
      return Math.max(distTopLeft, distTopRightCorner, distBottomLeftCorner, distBottomRightCorner);
    }
  }
  internalScope.getRayLength = getRayLength;
})();
