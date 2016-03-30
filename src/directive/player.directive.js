playerApp.directive('player', function ($timeout, $interval) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/src/partials/player.html',
    scope: {
      props: '='
    },
    link: function (scope) {
      var interval = '';
      var allAudio = [];
      var audioList = [];

      scope.curAudio = {
        name: '',
        author: '',
        duration: 0,
        cur_duration: 0,
        pause: true,
        stop: false,
        volume: 0.5
      };

      scope.pauseAndPlay = function () {
        scope.curAudio.pause = !scope.curAudio.pause;
        if (scope.curAudio.pause) {
          if (!_.isEmpty(allAudio)) {
            _.last(allAudio).pause().play;
          }
        } else {
          if (!_.isEmpty(allAudio)) {
            _.last(allAudio).play().play;
          } else {
            var firstEl = _.first(scope.props);
            audioList = _.map(scope.props, function (item) {
              return item.url;
            });
            var sound = new Howl({
              urls: audioList,
              autoplay: true,
              volume: scope.curAudio.volume
            });
            scope.curAudio.name = firstEl.title;
            scope.curAudio.author = firstEl.artist;
            scope.curAudio.duration = firstEl.duration;
            interval = $interval(function () {
              scope.curAudio.cur_duration = Math.floor(sound.pos());
            }, 1000);
            allAudio.push(sound);
          }
        }
      };

      scope.changeVolume = function () {
        _.last(allAudio).volume(scope.curAudio.volume).play;
        console.log('scope.curAudio.volume', scope.curAudio.volume);
      };

      scope.startAudio = function (audioItem) {
        scope.curAudio.pause = false;
        audioList = [audioItem.url];
        audioItem = addActiveClassItem(audioItem);
        if (!_.isEmpty(allAudio)) {
          _.each(allAudio, function (item) {
            item.stop().play;
          });
          $interval.cancel(interval);
          scope.curAudio.cur_duration = 0;
        }
        scope.curAudio.name = audioItem.title;
        scope.curAudio.author = audioItem.artist;
        scope.curAudio.duration = audioItem.duration;
        var sound = new Howl({
          urls: audioList,
          autoplay: true,
          volume: scope.curAudio.volume
        });
        interval = $interval(function () {
          scope.curAudio.cur_duration = Math.floor(sound.pos());
        }, 1000);
        allAudio.push(sound);
      };

      function addActiveClassItem(audioItem) {
        scope.props = _.map(scope.props, function (item) {
          item.active = false;
          return item
        });
        audioItem.active = true;

        return audioItem;
      }

      $timeout(function () {
        $(".nano").nanoScroller();
        $(".nano").nanoScroller({sliderMaxHeight: 10});
      }, 1000);

      $('input[type="range"]').rangeslider({
        polyfill: false,
        onInit: function () {
          $handle = $('.player-volume-character', this.$range);
        }
      });
    }
  };
});
