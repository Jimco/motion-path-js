/* global assert suite test internalScope */
'use strict';

(function () {
  suite('transforms', function () {
    test('offsetAnchor', function () {
      var assertInterpolation = internalScope.assertInterpolation;

      assertInterpolation({
        property: 'offsetAnchor',
        from: '10% 20%',
        to: '60%'
      }, [
        {at: 0, is: '10% 20%'},
        {at: 0.3, is: '25% 29%'},
        {at: 0.6, is: '40% 38%'},
        {at: 1, is: '60%'}
      ]);

      assertInterpolation({
        property: 'offsetAnchor',
        from: 'auto',
        to: '80% 30%'
      }, [
        {at: 0, is: 'auto'},
        {at: 0.3, is: 'auto'},
        {at: 0.6, is: '80% 30%'},
        {at: 1, is: '80% 30%'}
      ]);

      assertInterpolation({
        property: 'offsetAnchor',
        from: '15% 73%',
        to: 'auto'
      }, [
        {at: 0, is: '15% 73%'},
        {at: 0.3, is: '15% 73%'},
        {at: 0.6, is: 'auto'},
        {at: 1, is: 'auto'}
      ]);

      assertInterpolation({
        property: 'offsetAnchor',
        from: 'auto',
        to: 'auto'
      }, [
        {at: 0, is: 'auto'},
        {at: 0.3, is: 'auto'},
        {at: 0.6, is: 'auto'},
        {at: 1, is: 'auto'}
      ]);

      assertInterpolation({
        property: 'offsetAnchor',
        from: 'bottom 50% left 20px',
        to: '30% 40px'
      }, [
        {at: 0, is: 'bottom 50% left 20px'},
        {at: 0.3, is: '20px 50%'},
        {at: 0.6, is: '30% 40px'},
        {at: 1, is: '30% 40px'}
      ]);

      assertInterpolation({
        property: 'offsetAnchor',
        from: '20px',
        to: '30px 40%'
      }, [
        {at: 0, is: '20px'},
        {at: 0.3, is: '23px 47%'},
        {at: 0.6, is: '26px 44%'},
        {at: 1, is: '30px 40%'}
      ]);

      assertInterpolation({
        property: 'offsetAnchor',
        from: 'bottom',
        to: 'left'
      }, [
        {at: 0, is: 'bottom'},
        {at: 0.3, is: '35% 85%'},
        {at: 0.6, is: '20% 70%'},
        {at: 1, is: 'left'}
      ]);

      assertInterpolation({
        property: 'offsetAnchor',
        from: 'right',
        to: 'top'
      }, [
        {at: 0, is: 'right'},
        {at: 0.3, is: '85% 35%'},
        {at: 0.6, is: '70% 20%'},
        {at: 1, is: 'top'}
      ]);

      assert.equal(internalScope.offsetPositionAnchorParse('garbage% pants%'), undefined);
      assert.equal(internalScope.offsetPositionAnchorParse('garbage pants'), undefined);
      assert.equal(internalScope.offsetPositionAnchorParse('30% 40% 60%'), undefined);
      assert.equal(internalScope.offsetPositionAnchorParse('%'), undefined);
    });
  });
})();
