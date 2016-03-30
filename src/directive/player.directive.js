playerApp.directive('player', function ($timeout) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/src/partials/player.html',
    scope: {
      props: '='
    },
    link: function (scope) {
      var allAudio = [];
      scope.playAudio = function (audioItem) {
        if (!_.isEmpty(allAudio)) {
          _.each(allAudio, function (item) {
            item.stop().play;
          });
        }
        var sound = new Howl({
          urls: [audioItem.url],
          autoplay: true,
          volume: 1
        });
        allAudio.push(sound);

      };
      $timeout(function () {
        $(".nano").nanoScroller();
        $(".nano").nanoScroller({sliderMaxHeight: 10});
      }, 100)
    }
  };
});
