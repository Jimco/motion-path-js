/* global internalScope */
'use strict';

(function () {
  function convertTranslate (input) {
    var valuesArray = internalScope.translateParse(input);

    if (!valuesArray) {
      return null;
    }

    var result = valuesArray.map(function (x) {
      return x + 'px';
    });

    return 'translate3d(' + result.join(', ') + ')';
  }

  function convertRotate (input) {
    var valuesArray = internalScope.rotateParse(input);
    if (!valuesArray) {
      return null;
    }

    if (valuesArray.length > 1) {
      return 'rotate3d(' + valuesArray.join(', ') + 'deg)';
    }
    return 'rotate(' + valuesArray.join(', ') + 'deg)';
  }

  function convertScale (input) {
    var valuesArray = internalScope.scaleParse(input);
    if (!valuesArray) {
      return null;
    }
    return 'scale3d(' + valuesArray.join(', ') + ')';
  }

  var pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  function convertPath (properties, positionAnchor, element) {
    var offsetPath = internalScope.offsetPathParse(properties['offsetPath'], element);

    if (!offsetPath) {
      return null;
    }

    if (offsetPath.type === 'path') {
      return convertPathString(properties);
    }

    if (offsetPath.type === 'ray') {
      return convertRayString(properties, positionAnchor);
    }
  }

  function getOffsetDistanceLength (offsetDistance, pathLength, epsilon) {
    if (offsetDistance.unit === '%') {
      return Number(offsetDistance.value) * pathLength / 100 + epsilon;
    } else {
      return Number(offsetDistance.value) + epsilon;
    }
  }

  function isClosedLoop (path) {
    var pathInput = path.path.replace(/[,\s]+$/g, '');
    var lastPathInput = pathInput[pathInput.length - 1];

    return (lastPathInput === 'z' || lastPathInput === 'Z');
  }

  function getPathStringOffsetDistance (offsetPath, pathElement, offsetDistance, epsilon) {
    var closedLoop = isClosedLoop(offsetPath);
    var pathLength = pathElement.getTotalLength();

    var offsetDistanceLength = getOffsetDistanceLength(offsetDistance, pathLength, epsilon);

    if (closedLoop) {
      if (offsetDistanceLength < 0) {
        offsetDistanceLength = offsetDistanceLength % pathLength + pathLength;
      } else {
        offsetDistanceLength = offsetDistanceLength % pathLength;
      }
    } else if (offsetDistanceLength > pathLength) {
      offsetDistanceLength = pathLength;
    }

    return offsetDistanceLength;
  }

  function roundToHundredth (number) {
    return Math.round(number * 100) / 100;
  }

  function convertPathString (properties) {
    var offsetPath = internalScope.offsetPathParse(properties['offsetPath']);
    var closedLoop = isClosedLoop(offsetPath);

    var offsetDistance = internalScope.offsetDistanceParse(properties['offsetDistance']);
    if (offsetDistance === undefined) {
      offsetDistance = {value: 0, unit: 'px'};
    }

    pathElement.setAttribute('d', offsetPath.path);
    var totalPathLength = pathElement.getTotalLength();

    var currentOffsetDistance = getPathStringOffsetDistance(offsetPath, pathElement, offsetDistance, 0);

    var epsilon = 0.0001;
    var rotateFlip = false;
    if (!closedLoop && (currentOffsetDistance + epsilon) > totalPathLength) {
      epsilon *= -1;
      rotateFlip = true;
    }
    var nextOffsetDistance = getPathStringOffsetDistance(offsetPath, pathElement, offsetDistance, epsilon);

    var currentPoint = pathElement.getPointAtLength(currentOffsetDistance);
    var nextPoint = pathElement.getPointAtLength(nextOffsetDistance);

    var deltaX = nextPoint.x - currentPoint.x;
    var deltaY = nextPoint.y - currentPoint.y;

    var rotation = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

    if (rotateFlip) {
      rotation += 180;
    }

    return {deltaX: roundToHundredth(currentPoint.x), deltaY: roundToHundredth(currentPoint.y), rotation: roundToHundredth(rotation)};
  }

  function convertRayString (properties, positionAnchor) {
    var offsetPath = internalScope.offsetPathParse(properties['offsetPath']);
    var rayLength = 0;

    if (positionAnchor) {
      rayLength = internalScope.getRayLength(offsetPath.size,
                                             positionAnchor.containerWidth,
                                             positionAnchor.containerHeight,
                                             positionAnchor.offsetPosX,
                                             positionAnchor.offsetPosY,
                                             offsetPath.angle);
    }

    var offsetDistance = internalScope.offsetDistanceParse(properties['offsetDistance']);

    if (offsetDistance === undefined) {
      offsetDistance = {value: 0, unit: 'px'};
    }

    var offsetDistanceLength = getOffsetDistanceLength(offsetDistance, rayLength, 0);

    var deltaX = Math.sin(offsetPath.angle * Math.PI / 180) * offsetDistanceLength;
    var deltaY = (-1) * Math.cos(offsetPath.angle * Math.PI / 180) * offsetDistanceLength;

    return {
      deltaX: roundToHundredth(deltaX),
      deltaY: roundToHundredth(deltaY),
      rotation: (offsetPath.angle - 90)};
  }

  function convertOffsetAnchorPosition (properties, element) {
    // According to spec: https://drafts.fxtf.org/motion-1/#offset-anchor-property
    // If offset-anchor is set to auto then it will compute to the value of offset-position.
    if (!element) {
      return null;
    }

    var position = 'auto';
    if ('offsetPosition' in properties) {
      position = internalScope.offsetPositionAnchorParse(properties['offsetPosition']);
      if (!position) {
        position = 'auto';
      }
    }

    var anchor = 'auto';
    if ('offsetAnchor' in properties) {
      anchor = internalScope.offsetPositionAnchorParse(properties['offsetAnchor']);
      if (!anchor) {
        anchor = 'auto';
      }
    }

    var transformOrigin = window.getComputedStyle(element).transformOrigin;
    transformOrigin = transformOrigin.split(/\s+/).map(internalScope.offsetDistanceParse);

    if (anchor === 'auto') {
      if (position === 'auto' || (properties['offsetPath'] && properties['offsetPath'] !== 'none')) {
        anchor = transformOrigin;
      } else {
        anchor = position;
      }
    }

    // TODO: find a way of doing this that doesn't involve _style
    var savedTransform = element.style._style.transform;
    // clear the transform so we can access the starting position of the element.
    element.style._style.transform = 'none';

    var offsetLeft = element.offsetLeft;
    var offsetTop = element.offsetTop;

    var elementProperties = element.getBoundingClientRect();
    var parentProperties = element.offsetParent ? element.offsetParent.getBoundingClientRect() : null;
    element.style._style.transform = savedTransform;

    if (!parentProperties) {
      return null;
    }

    var anchorPosX = anchor[0].value;
    var anchorPosY = anchor[1].value;
    if (anchor[0].unit === '%') {
      anchorPosX = (anchorPosX * elementProperties.width) / 100;
    }
    if (anchor[1].unit === '%') {
      anchorPosY = (anchorPosY * elementProperties.height) / 100;
    }

    var offsetPosX;
    var offsetPosY;
    if (position === 'auto') {
      offsetPosX = offsetLeft + anchorPosX;
      offsetPosY = offsetTop + anchorPosY;
    } else {
      offsetPosX = position[0].value;
      offsetPosY = position[1].value;
      if (position[0].unit === '%') {
        offsetPosX = (offsetPosX * parentProperties.width) / 100;
      }
      if (position[1].unit === '%') {
        offsetPosY = (offsetPosY * parentProperties.height) / 100;
      }
    }

    return {
      deltaX: (offsetPosX - anchorPosX) - offsetLeft,
      deltaY: (offsetPosY - anchorPosY) - offsetTop,
      anchorX: anchorPosX,
      anchorY: anchorPosY,
      transformOriginX: transformOrigin[0].value,
      transformOriginY: transformOrigin[1].value,
      offsetPosX: offsetPosX,
      offsetPosY: offsetPosY,
      containerWidth: parentProperties.width,
      containerHeight: parentProperties.height
    };
  }

  function convertOffsetRotate (properties, element) {
    var value = null;
    if ('offsetRotate' in properties) {
      value = internalScope.offsetRotateParse(properties['offsetRotate']);
    }

    if (!value) {
      return {angle: 0, auto: true};
    }

    return value;
  }

  function convertOffsetToTransform (properties, element) {
    /* W3C spec for what syntax toTransform() outputs:
       https://drafts.csswg.org/css-transforms/#transform-functions
       W3C spec for what syntax toTransform() parses:
       https://drafts.csswg.org/css-transforms-2/#individual-transforms
       https://drafts.fxtf.org/motion-1/#motion-paths-overview
    */
    var positionAnchor = convertOffsetAnchorPosition(properties, element);
    var pathTransform = convertPath(properties, positionAnchor, element);
    var parsedRotate = convertOffsetRotate(properties);
    var rotation = parsedRotate.angle;
    var path = internalScope.offsetPathParse(properties['offsetPath']);

    if (!pathTransform && !('offsetPosition' in properties)) {
      return null;
    }

    if (!pathTransform) {
      pathTransform = {deltaX: 0, deltaY: 0, rotation: 0};
    }

    if (parsedRotate.auto) {
      rotation += pathTransform.rotation;
    }

    if (!positionAnchor) {
      positionAnchor = {deltaX: 0, deltaY: 0};
    }

    var anchorX = positionAnchor.anchorX;
    var anchorY = positionAnchor.anchorY;
    var transformOriginX = positionAnchor.transformOriginX;
    var transformOriginY = positionAnchor.transformOriginY;
    var transform = 'translate3d(' +
        (pathTransform.deltaX + positionAnchor.deltaX) + 'px, ' +
        (pathTransform.deltaY + positionAnchor.deltaY) + 'px, 0px)';

    if (path !== undefined) {
      if (rotation !== undefined && rotation !== 0) {
        if (anchorX !== transformOriginX && anchorY !== transformOriginY) {
          var beforeShiftX = anchorX - transformOriginX;
          var beforeShiftY = anchorY - transformOriginY;
          var beforeShiftStr = 'translate3d(' + beforeShiftX + 'px, ' + beforeShiftY + 'px, 0px)';
          var afterShiftX = (-1) * beforeShiftX;
          var afterShiftY = (-1) * beforeShiftY;
          var afterShiftStr = 'translate3d(' + afterShiftX + 'px, ' + afterShiftY + 'px, 0px)';
          transform += ' ' + beforeShiftStr + ' rotate(' + rotation + 'deg) ' + afterShiftStr;
          return transform;
        }
        transform += ' rotate(' + rotation + 'deg)';
      }
    }
    return transform;
  }

  function toTransform (properties, element) {
    /* W3C spec for what syntax toTransform() outputs:
       https://drafts.csswg.org/css-transforms/#transform-functions
       W3C spec for what syntax toTransform() parses:
       https://drafts.csswg.org/css-transforms-2/#individual-transforms
       https://drafts.fxtf.org/motion-1/#motion-paths-overview
    */
    return [
      convertTranslate(properties.translate),
      convertRotate(properties.rotate),
      convertScale(properties.scale),
      convertOffsetToTransform(properties, element)
    ].filter(function (result) {
      return result !== null;
    }).join(' ') || 'none';
  }

  internalScope.toTransform = toTransform;
})();
