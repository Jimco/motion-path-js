/* global assert internalScope */

(function () {
  var InvalidTransformValue = {};

  function checkTransformKeyframes (keyframes) {
    var target = document.createElement('div');

    for (var value of keyframes) {
      target.style.transform = '';
      target.style.transform = value;
      if (value === InvalidTransformValue) {
        continue;
      }
      assert.notEqual(target.style.transform, '',
        'Invalid expected keyframe: ' + value);
    }
  }

  function isAnimationEqual (actualKeyframes, expectedKeyframes) {
    var timing = {duration: 1};
    var currentTimes = [0.10, 0.25, 0.50, 0.75, 0.90];

    checkTransformKeyframes(expectedKeyframes.transform);

    for (var currentTime of currentTimes) {
      var actualTarget = document.createElement('div');
      document.body.appendChild(actualTarget);

      var expectedTarget = document.createElement('div');
      document.body.appendChild(expectedTarget);

      var animation = actualTarget.animate(actualKeyframes, timing);
      animation.currentTime = currentTime;
      var result = window.getComputedStyle(actualTarget).transform;
      animation.cancel();

      animation = expectedTarget.animate(expectedKeyframes, timing);
      animation.currentTime = currentTime;
      var expected = window.getComputedStyle(expectedTarget).transform;
      animation.cancel();

      actualTarget.remove();
      expectedTarget.remove();

      assert.equal(result, expected, 'at currentTime ' + currentTime + ' comparing ' + JSON.stringify(actualKeyframes) + ' with ' + JSON.stringify(expectedKeyframes));
    }
  }

  function assertInterpolationHelper (keyframes, expectation, propertyToRead) {
    var target = document.createElement('div');

    for (var {at, is} of expectation) {
      var timing = {duration: 1, fill: 'forwards'};

      assert.equal((at > 1 || at < 0), false, "Invalid value for 'at'");

      var animation = target.animate(keyframes, timing);

      animation.currentTime = at;
      var result = target.style._getAnimated(propertyToRead);
      animation.cancel();

      assert.equal(result, is, 'For: ' + JSON.stringify(keyframes) + ' at: ' + at + '\n');
    }
  }

  function assertTransformInterpolation (keyframes, expectation) {
    assertInterpolationHelper(keyframes, expectation, 'transform');
  }

  function assertInterpolation ({property, from, to}, expectation) {
    assertInterpolationHelper({[property]: [from, to]}, expectation, property + 'ForTesting');
  }

  function assertOffsetInterpolation ({property, from, to}, expectation) {
    assertInterpolationHelper({[property]: [from, to]}, expectation, property);
  }

  function assertNoInterpolation (transformation) {
    var expectation = [];
    for (var i = 0; i <= 1; i += 0.1) {
      expectation.push({at: i, is: i < 0.5 ? transformation.from : transformation.to});
    }
    assertOffsetInterpolation(transformation, expectation);
  }

  internalScope.isAnimationEqual = isAnimationEqual;
  internalScope.checkTransformKeyframes = checkTransformKeyframes;
  internalScope.InvalidTransformValue = InvalidTransformValue;
  internalScope.assertTransformInterpolation = assertTransformInterpolation;
  internalScope.assertOffsetInterpolation = assertOffsetInterpolation;
  internalScope.assertInterpolation = assertInterpolation;
  internalScope.assertNoInterpolation = assertNoInterpolation;
})();

