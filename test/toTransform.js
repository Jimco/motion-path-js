/* global suite test assert internalScope */
(function () {
  var toTransform = internalScope.toTransform;
  var InvalidArgument = internalScope.InvalidArgument;

  suite('toTransform', function () {
    test('convertTranslate', function () {
      assert.equal(toTransform({translate: 'none'}), 'translate3d(0px, 0px, 0px)');
      assert.equal(toTransform({translate: '0.6px'}), 'translate3d(0.6px, 0px, 0px)');
      assert.equal(toTransform({translate: '50px'}), 'translate3d(50px, 0px, 0px)');
      assert.equal(toTransform({translate: '20px 30px'}), 'translate3d(20px, 30px, 0px)');
      assert.equal(toTransform({translate: '20px 30px 90px'}), 'translate3d(20px, 30px, 90px)');
    });

    test('convertRotate', function () {
      assert.equal(toTransform({rotate: '20 10'}), 'none');
      assert.equal(toTransform({rotate: ''}), 'none');
      assert.equal(toTransform({rotate: 'garbage'}), 'none');
      assert.equal(toTransform({rotate: '300degrees'}), 'none');
      assert.equal(toTransform({rotate: 'threedegrees'}), 'none');
      assert.equal(toTransform({rotate: '10 hello 20 30deg'}), 'none');
      assert.equal(toTransform({rotate: 'garbagedeg'}), 'none');

      assert.equal(toTransform({rotate: 'none'}), 'rotate3d(0, 0, 1, 0deg)');
      var expectedDeg = 100 * (180 / Math.PI);
      assert.equal(toTransform({rotate: '50 10 30 100rad'}), 'rotate3d(50, 10, 30, ' + expectedDeg + 'deg)');
      assert.equal(toTransform({rotate: '15turn'}), 'rotate(5400deg)');
      assert.equal(toTransform({rotate: '200deg'}), 'rotate(200deg)');
      assert.equal(toTransform({rotate: '20grad'}), 'rotate(18deg)');
      expectedDeg = 164 * (180 / Math.PI);
      assert.equal(toTransform({rotate: '164rad'}), 'rotate(' + expectedDeg + 'deg)');
    });

    test('convertScale', function () {
      assert.equal(toTransform({scale: ''}), 'none');
      assert.equal(toTransform({scale: 'a'}), 'none');
      assert.equal(toTransform({scale: '2 a'}), 'none');
      assert.equal(toTransform({scale: '2 3 4 5'}), 'none');


      assert.equal(toTransform({scale: 'none'}), 'scale3d(1, 1, 1)');
      assert.equal(toTransform({scale: '2'}), 'scale3d(2, 1, 1)');
      assert.equal(toTransform({scale: '2 3'}), 'scale3d(2, 3, 1)');
      assert.equal(toTransform({scale: '2 3 4'}), 'scale3d(2, 3, 4)');
    });
  });
})();
