playerApp.directive('player', function ($timeout, $interval) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/vk-pages/src/partials/player.html',
    scope: {
      props: '='
    },
    link: function (scope) {
      var interval = '';
      var allAudio = [];
      var audioList = [];
      var nextPlayStat = true;

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
            addActiveClassItem(firstEl);
            var sound = new Howl({
              urls: audioList,
              autoplay: true,
              volume: scope.curAudio.volume
            });
            interval = $interval(function () {
              scope.curAudio.cur_duration = Math.floor(sound.pos());
            }, 1000);
            allAudio.push(sound);
          }
        }
      };

      scope.changeVolume = function () {
        _.last(allAudio).volume(scope.curAudio.volume).play;
      };

      scope.startAudio = function (audioItem) {
        scope.curAudio.pause = false;
        audioList = [audioItem.url];
        audioItem = addActiveClassItem(audioItem);
        if (!_.isEmpty(allAudio)) {
          stopAll();

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

      scope.nextPlay = function (status) {
        if (!nextPlayStat) {
          return false;
        }
        nextPlayStat = false;
        var curPlay = _.last(allAudio);
        var sizeProps = _.size(scope.props);
        var indexSound = 0;

        _.each(scope.props, function (item, index) {
          if (item.url === curPlay._src) {
            indexSound = index;
          }
        });
        if (status) {
          indexSound++;
        } else {
          indexSound--;
        }
        if (indexSound < 0) {
          indexSound = sizeProps - 1;
        }
        if (indexSound > sizeProps - 1) {
          indexSound = 0;
        }
        addActiveClassItem(scope.props[indexSound]);
        var sound = new Howl({
          urls: [scope.props[indexSound].url],
          autoplay: true,
          volume: scope.curAudio.volume
        });
        interval = $interval(function () {
          scope.curAudio.cur_duration = Math.floor(sound.pos());
        }, 1000);
        allAudio.push(sound);
        $timeout(function () {
          nextPlayStat = true;
        }, 400);
      };


      function stopAll() {
        _.each(allAudio, function (item) {
          item.stop().play;
        });
        $interval.cancel(interval);
      }

      function addActiveClassItem(audioItem) {
        stopAll();
        scope.curAudio.name = audioItem.title;
        scope.curAudio.author = audioItem.artist;
        scope.curAudio.duration = audioItem.duration;
        scope.props = _.map(scope.props, function (item) {
          item.active = false;
          return item
        });
        audioItem.active = true;
        return audioItem;
      }
    }
  };
});
