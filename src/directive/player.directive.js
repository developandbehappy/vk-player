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
      var intervalCutName = '';
      var nanoInterval = '';
      var allAudio = [];
      var audioList = [];
      scope.nextPlayStat = true;
      scope.auth = false;
      scope.loopStyle = 0.6;

      scope.curAudio = {
        name: '',
        author: '',
        src: '',
        duration: 0,
        cur_duration: 0,
        pause: true,
        stop: false,
        volume: 0.5,
        photo_author: '/images/default_avatar.jpg',
        wrapper_author: '',
        style: '',
        mute: false,
        loop: false
      };

      VK.Auth.getLoginStatus(function (response) {
        if (response.session) {
          scope.auth = true;
          getAudio();
          init();
        }
      });

      scope.logout = function () {
        scope.auth = false;
        scope.props = [];
        VK.Auth.logout();
        logout();
      };

      scope.login = function () {
        VK.Auth.login(function (res) {
          if (res.session) {
            scope.auth = true;
            getAudio();
            init();
          }
        }, 65536 + 8);
      };

      scope.randomTrack = function () {
        scope.props = _.sortBy(scope.props, function () {
          return 0.5 * Math.random();
        })
      };

      scope.pauseAndPlay = function () {
        if (scope.props.length === 0) {
          return false
        }
        scope.curAudio.pause = !scope.curAudio.pause;
        if (scope.curAudio.pause) {
          if (!_.isEmpty(allAudio)) {
            _.last(allAudio).pause();
          }
        } else {
          if (!_.isEmpty(allAudio)) {
            _.last(allAudio).play();
          } else {
            var firstEl = _.first(scope.props);
            addActiveClassItem(firstEl);
            runningString(scope.curAudio.name);
            var sound = new playerCore('playerCore', scope.curAudio.src, scope.curAudio.volume, nextPlay);
            sound.play();
            getArtistPhoto();
            interval = $interval(function () {
              scope.curAudio.cur_duration = sound.position();
              setBkgCurPosition();
            }, 50);
            allAudio.push(sound);
          }
        }
      };


      scope.mute = function () {
        var curAudio = _.last(allAudio);
        var curVolume = scope.curAudio.volume;
        if (!curAudio || curVolume == 0) {
          return false;
        }
        var volume = scope.curAudio.mute;
        if (!volume) {
          scope.curAudio.mute = true;
          curAudio.volume(0);
        } else {
          scope.curAudio.mute = false;
          curAudio.volume(curVolume);
        }
      };


      scope.changeVolume = function (status) {
        if (!_.last(allAudio)) {
          return false;
        }
        scope.curAudio.mute = false;
        var volume = scope.curAudio.volume;
        volume = Number(volume);
        if (status === 'up') {
          volume += 0.05;
        }
        if (status === 'down') {
          volume -= 0.05;
        }
        if (volume > 1 || volume < 0) {
          return false;
        }
        rangeVolume.val(volume).change();
        _.last(allAudio).volume(volume);
      };

      scope.startAudio = function (audioItem) {
        if (audioItem.url == scope.curAudio.src) {
          scope.pauseAndPlay();
          return false
        }
        scope.curAudio.pause = false;
        audioList = audioItem.url;
        audioItem = addActiveClassItem(audioItem);
        if (!_.isEmpty(allAudio)) {
          //stopAll();
          scope.curAudio.cur_duration = 0;
        }
        scope.curAudio.name = audioItem.title;
        scope.curAudio.author = audioItem.artist;
        scope.curAudio.duration = audioItem.duration;
        getArtistPhoto();
        $interval.cancel(intervalCutName);
        runningString(scope.curAudio.name);
        var sound = new playerCore('playerCore', audioList, scope.curAudio.volume, nextPlay);
        sound.play();
        interval = $interval(function () {
          scope.curAudio.cur_duration = sound.position();
          setBkgCurPosition();
        }, 50);
        allAudio.push(sound);
      };

      scope.nextPlay = function (status) {
        scope.curAudio.cur_duration = 0;
        if (!scope.nextPlayStat || _.isEmpty(allAudio)) {
          return false;
        }
        scope.nextPlayStat = false;
        scope.curAudio.pause = false;
        var curPlay = _.last(allAudio);
        var sizeProps = _.size(scope.props);
        var indexSound = 0;
        _.each(scope.props, function (item, index) {
          if (item.url === curPlay.src) {
            indexSound = index;
          }
        });
        if (status) {
          indexSound++;
        } else {
          indexSound--;
        }
        changeScrollPosition(indexSound);
        if (indexSound < 0) {
          indexSound = sizeProps - 1;
        } else if (indexSound > sizeProps - 1 && indexSound > 0) {
          indexSound = 0;
        }
        addActiveClassItem(scope.props[indexSound]);
        var sound = new playerCore('playerCore', scope.curAudio.src, scope.curAudio.volume, nextPlay);
        sound.play();

        getArtistPhoto();
        interval = $interval(function () {
          scope.curAudio.cur_duration = sound.position();
          setBkgCurPosition();
        }, 100);
        allAudio.push(sound);
        $timeout(function () {
          scope.nextPlayStat = true;
        }, 400);
        $interval.cancel(intervalCutName);
        runningString(scope.curAudio.name);
      };


      scope.loop = function () {
        var curAudio = _.last(allAudio);
        if (!curAudio) {
          return false
        }
        if (scope.curAudio.loop) {
          scope.curAudio.loop = false;
          scope.loopStyle = 0.6;
          curAudio.loop(false);
        } else {
          scope.loopStyle = 1;
          scope.curAudio.loop = true;
          curAudio.loop(true);
        }
      };

      scope.downloadCurAudio = function () {
        var curAudio = _.last(allAudio);
        var link = document.createElement('a');
        link.setAttribute('href', curAudio.src);
        link.setAttribute('download', 'download');
        link.click();
      };


      function setBkgCurPosition() {
        $interval.cancel(nanoInterval);
        var duration = scope.curAudio.duration;
        var curDuration = scope.curAudio.cur_duration;
        var getProcent = 100 - (curDuration * 100) / duration;
        var curDeg = (174 + (getProcent)) + 'deg';
        scope.curAudio.style = 'background: linear-gradient(' + curDeg + ', #33272e ' + getProcent + '%, #edb159 ' + (getProcent + 0.5) + '%);';
      }


      function addActiveClassItem(audioItem) {
        setCurrentAudioData(audioItem);
        scope.props = _.map(scope.props, function (item) {
          item.active = false;
          return item
        });
        audioItem.active = true;
        return audioItem;
      }

      function logout() {
        var curAudio = _.last(allAudio);
        if (curAudio) {
          _.last(allAudio).pause();
        }
        $interval.cancel(intervalCutName);
        $interval.cancel(interval);
        allAudio = [];
        scope.curAudio.src = '';
        scope.curAudio.mute = false;
        scope.curAudio.name = '';
        scope.curAudio.pause = true;
        scope.curAudio.author = '';
        scope.curAudio.duration = 0;
        scope.curAudio.photo_author = '/images/default_avatar.jpg';
        $timeout(function () {
          scope.curAudio.cur_duration = 0;
        }, 500);
        setBkgCurPosition();
      }

      function setCurrentAudioData(audioItem) {
        scope.curAudio.mute = false;
        scope.curAudio.name = audioItem.title;
        scope.curAudio.author = audioItem.artist;
        scope.curAudio.duration = audioItem.duration;
        scope.curAudio.src = audioItem.url;
      }

      var rangeVolume = $("#rangeVolume");
      rangeVolume.rangeslider({
        polyfill: false,
        onInit: function () {
          $handle = $('.player-volume-character', this.$range);
        }
      });

      /**
       * take item place in playlist
       * @param value
       */
      function changeScrollPosition(value) {
        scope.loopStyle = 0.6;
        var heightItem = 40;
        var defaultScrollItem = 4;
        var lengthAllAudio = scope.props.length;
        var valChange = heightItem * (value - defaultScrollItem);
        if (valChange < -(heightItem * defaultScrollItem)) {
          valChange = heightItem * lengthAllAudio
        } else if (valChange === (heightItem * lengthAllAudio) - (heightItem * defaultScrollItem)) {
          valChange = -160;
        }
        $(".nano").nanoScroller({scrollTop: valChange});
      }

      function runningString(str) {
        var strLength = scope.curAudio.name.length;
        var cutName = scope.curAudio.name;
        scope.curAudio.name = scope.curAudio.name.trim();
        var curCut = 0;
        if (strLength <= 12) {
          return false;
        }
        intervalCutName = $interval(function () {
          if (scope.curAudio.name[0] === ' ' && _.last(scope.curAudio.name) !== ' ') {
            curCut++
          }
          curCut++;
          if (curCut === strLength) {
            curCut = 0;
            cutName = str;
          }
          scope.curAudio.name = str.substring(curCut, strLength);
        }, 300);
      }

      function nextPlay() {
        scope.nextPlay(true);
      }

      function init() {
        // Временно гавнокодим, т.к не знаю как отследить прием данных с вк.. Его эти VK функции ужс нет ни then, finally
        var nano = $(".nano");
        nanoInterval = $interval(function () {
          nano.nanoScroller({
            sliderMaxHeight: 10,
            alwaysVisible: true
          });
          nano.nanoScroller();
        }, 500);
      }

      function getAudio() {
        VK.Api.call('audio.get', {}, function (res) {
          scope.props = res.response;
        });
      }

      function getArtistPhoto() {
        VK.Api.call('groups.search', {
          q: scope.curAudio.author,
          sort: 2,
          count: 20
        }, function (res) {
          var dataWithImage = _.filter(res.response, function (item) {
            return item.photo_big;
          }).filter(function (item) {
            return item.photo_big !== 'http://vk.com/images/community_200.png'
          });
          var firstRandom = _.first(_.sortBy(dataWithImage, function () {
            return 0.5 * Math.random();
          }));
          if (!firstRandom) {
            scope.curAudio.photo_author = '/images/default_avatar.jpg';
            return false;
          }
          scope.curAudio.photo_author = firstRandom.photo_big;
        });
      }

      bindButtons();
      function bindButtons() {
        Mousetrap.bind('ctrl+alt+right', function () {
          scope.nextPlay(true)
        });
        Mousetrap.bind('ctrl+alt+left', function () {
          scope.nextPlay()
        });
        Mousetrap.bind('ctrl+alt+up', function () {
          scope.changeVolume('up')
        });
        Mousetrap.bind('ctrl+alt+down', function () {
          scope.changeVolume('down')
        });
      }

    }
  };
});
