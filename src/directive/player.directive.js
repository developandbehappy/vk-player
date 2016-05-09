playerApp.directive('player', function ($timeout, $interval, $http) {
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
      var currentAudio = [];
      var audioList = [];
      var token = localStorage.getItem('playerToken');
      var playerId = $('#player');
      var playerLogo = $('.player-logo');
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

      playerId.css({
        'background-image': 'url(' + scope.curAudio.photo_author + ')'
      });
      playerLogo.css({
        'background': 'url(' + scope.curAudio.photo_author + ') no-repeat center center'
      });
      if (token) {
        getAudio();
      }

      scope.logout = function () {
        scope.auth = false;
        scope.props = [];
        VK.Auth.logout();
        logout();
      };

      scope.login = function () {
        VK.Auth.login(function (res) {
          if (res.session) {
            localStorage.setItem('playerToken', res.session.sid);
            token = res.session.sid;
            $timeout(function () {
              getAudio();
            }, 300);
          }
        }, 65536 + 8);
      };

      scope.randomTrack = function () {
        scope.props = _.sortBy(scope.props, function () {
          return 0.5 * Math.random();
        });
        _.each(scope.props, function (item, index) {
          if (item.url === scope.curAudio.src) {
            changeScrollPosition(index);
          }
        });
      };

      scope.pauseAndPlay = function () {
        if (scope.props.length === 0) {
          return false
        }
        scope.curAudio.pause = !scope.curAudio.pause;
        if (scope.curAudio.pause) {
          if (!_.isEmpty(currentAudio)) {
            currentAudio.pause();
          }
        } else {
          if (!_.isEmpty(currentAudio)) {
            currentAudio.play();
          } else {
            var firstEl = _.first(scope.props);
            addActiveClassItem(firstEl);
            if (saveAndGetDataFromLocalStorage('read')) {
              var localStorageData = JSON.parse(saveAndGetDataFromLocalStorage('read'));
              _.each(scope.props, function (item) {
                if (item.artist === localStorageData.author && item.duration === localStorageData.duration) {
                  addActiveClassItem(item);
                }
              });
            }
            runningString(scope.curAudio.name);
            $interval.cancel(interval);
            var sound = new playerCore('playerCore', scope.curAudio.src, scope.curAudio.volume, nextPlay);
            if (scope.curAudio.cur_duration) {
              sound.setTime(scope.curAudio.cur_duration);
              scope.curAudio.pause = false;
            } else {
              getArtistPhoto();
            }
            sound.play();
            interval = $interval(function () {
              scope.curAudio.cur_duration = sound.position();
              setBkgCurPosition();
            }, 1000 / 60);
            currentAudio = sound;
          }
        }
      };


      scope.mute = function () {
        var curAudio = currentAudio;
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
        if (_.isEmpty(currentAudio)) {
          rangeVolume.val(scope.curAudio.volume).change();
          return false;
        }
        scope.curAudio.mute = false;
        var volume = scope.curAudio.volume;
        volume = Number(volume);
        if (status === 'up') {
          volume += 0.05;
        }
        if (status === 'down') {
          volume -= 0.02;
        }
        if (volume > 1 || volume < 0) {
          return false;
        }
        rangeVolume.val(volume).change();
        currentAudio.volume(volume);
      };

      $(".player-logo-wrapper").on('click', function (e) {
        if (e.target.className === 'player-logo') {
          return false
        }
        var parentOffset = $(this).parent().offset();
        var relY = e.pageY - parentOffset.top;
        var relX = e.pageX - parentOffset.left;
        var maxPoint = 280; // 100%
        var value = relY;
        var getProcent = 100 - (value * 100) / maxPoint;
        if (relY >= 170) {
          value = relX;
          getProcent = (value * 100) / maxPoint;
        }
        var currentTime = (getProcent * scope.curAudio.duration) / 100;
        goToFewSeconds('set', currentTime);
      });

      scope.startAudio = function (audioItem) {
        if (audioItem.url == scope.curAudio.src) {
          scope.pauseAndPlay();
          return false
        }
        scope.curAudio.pause = false;
        audioList = audioItem.url;
        audioItem = addActiveClassItem(audioItem);
        if (!_.isEmpty(currentAudio)) {
          scope.curAudio.cur_duration = 0;
        }
        scope.curAudio.name = audioItem.title;
        scope.curAudio.author = audioItem.artist;
        scope.curAudio.duration = audioItem.duration;
        getArtistPhoto();
        $interval.cancel(intervalCutName);
        $interval.cancel(interval);
        runningString(scope.curAudio.name);
        var sound = new playerCore('playerCore', audioList, scope.curAudio.volume, nextPlay);
        sound.play();
        interval = $interval(function () {
          scope.curAudio.cur_duration = sound.position();
          setBkgCurPosition();
        }, 1000 / 60);
        currentAudio = sound;
      };

      scope.nextPlay = function (status) {
        scope.curAudio.cur_duration = 0;
        if (!scope.nextPlayStat) {
          return false;
        }
        scope.nextPlayStat = false;
        scope.curAudio.pause = false;
        var curPlay = currentAudio;
        var sizeProps = _.size(scope.props);
        var indexSound = 0;
        if (!_.isEmpty(curPlay)) {
          _.each(scope.props, function (item, index) {
            if (item.url === curPlay.src) {
              indexSound = index;
            }
          });
        } else {
          var localStorageData = saveAndGetDataFromLocalStorage('read');
          if (localStorageData) {
            localStorageData = JSON.parse(localStorageData);
            _.each(scope.props, function (item, index) {
              if (item.artist === localStorageData.author && item.duration === localStorageData.duration) {
                indexSound = index;
              }
            });
          } else {
            indexSound = 0;
          }
        }
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
        $interval.cancel(interval);
        addActiveClassItem(scope.props[indexSound]);
        var sound = new playerCore('playerCore', scope.curAudio.src, scope.curAudio.volume, nextPlay);
        sound.play();
        getArtistPhoto();
        interval = $interval(function () {
          scope.curAudio.cur_duration = sound.position();
          setBkgCurPosition();
        }, 1000 / 60);
        currentAudio = sound;
        $timeout(function () {
          scope.nextPlayStat = true;
        }, 400);
        $interval.cancel(intervalCutName);
        runningString(scope.curAudio.name);
      };


      scope.loop = function () {
        var curAudio = currentAudio;
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
        var curAudio = currentAudio;
        var link = document.createElement('a');
        link.setAttribute('href', curAudio.src);
        link.setAttribute('download', 'download');
        link.click();
      };


      function setBkgCurPosition() {
        saveAndGetDataFromLocalStorage('save');
        var duration = scope.curAudio.duration;
        var curDuration = scope.curAudio.cur_duration;
        var getProcent = 100 - (curDuration * 100) / duration;
        var curDeg = (175 + (getProcent)) + 'deg';
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
        if (currentAudio && scope.curAudio.pause === false) {
          currentAudio.pause();
        }
        $interval.cancel(intervalCutName);
        $interval.cancel(interval);
        currentAudio = [];
        scope.curAudio.src = '';
        scope.curAudio.mute = false;
        scope.curAudio.name = '';
        scope.curAudio.pause = true;
        scope.curAudio.author = '';
        scope.curAudio.duration = 0;
        scope.curAudio.photo_author = '/images/default_avatar.jpg';
        scope.curAudio.cur_duration = 0;
        scope.curAudio.style = '';
        localStorage.setItem('playerData', '');
        localStorage.setItem('playerToken', '');
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
        $(".nano").nanoScroller({
          scrollTop: valChange
        });
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
        var nano = $(".nano");
        nano.nanoScroller({
          sliderMaxHeight: 10,
          alwaysVisible: true
        });
        nano.nanoScroller();
        if (scope.curAudio.src) {
          _.each(scope.props, function (item, index) {
            if (item.artist === scope.curAudio.author && item.duration === scope.curAudio.duration) {
              changeScrollPosition(index);
              scope.changeVolume();
              scope.props = _.map(scope.props, function (item) {
                item.active = false;
                return item
              });
              item.active = true;
            }
          });
        }
      }

      function getAudio() {
        var url = 'https://api.vk.com/method/audio.get?access_token=' + token + '&callback=JSON_CALLBACK';
        $http.jsonp(url).then(function (res) {
          if (res.data.error) {
            scope.login();
            return false;
          }
          scope.props = res.data.response;
          scope.auth = true;
          $timeout(function () {
            init();
          }, 100);
        });
        if (saveAndGetDataFromLocalStorage('read')) {
          scope.curAudio = JSON.parse(saveAndGetDataFromLocalStorage('read'));
          scope.curAudio.pause = true;
        }
      }

      function getArtistPhoto() {
        var url = 'https://api.vk.com/method/groups.search?q=' + scope.curAudio.author + '&sort=2&count=20&access_token=' + token + '&callback=JSON_CALLBACK';
        $http.jsonp(url).then(function (res) {

          if (res.data.error || res.data.response[0] === 0) {
            scope.curAudio.photo_author = '/images/default_avatar.jpg';
            return false;
          }
          var dataWithImage = _.filter(res.data.response, function (item) {
            return item.photo_big;
          }).filter(function (item) {
            return item.photo_big !== 'http://vk.com/images/community_200.png'
          });
          var firstRandom = _.first(_.sortBy(dataWithImage, function () {
            return 0.5 * Math.random();
          }));
          scope.curAudio.photo_author = _.isEmpty(firstRandom) ? '/images/default_avatar.jpg' : firstRandom.photo_big;
        });
      }

      function goToFewSeconds(type, time) {
        if (_.isEmpty(currentAudio)) {
          return false
        }
        var curTime = Number(scope.curAudio.cur_duration);
        if (type === 'forward') {
          currentAudio.setTime(curTime + 5);
        }
        if (type === 'back') {
          currentAudio.setTime(curTime - 5);
        }
        if (type === 'set') {
          currentAudio.setTime(time);
        }
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
        Mousetrap.bind('ctrl+alt+space', function () {
          scope.pauseAndPlay();
        });
        Mousetrap.bind('alt+right', function () {
          goToFewSeconds('forward');
        });
        Mousetrap.bind('alt+left', function () {
          goToFewSeconds('back');
        });
      }

      function saveAndGetDataFromLocalStorage(type) {
        if (type === 'save') {
          var storage = JSON.stringify(scope.curAudio);
          localStorage.setItem('playerData', storage);
        }
        if (type === 'read') {
          return localStorage.getItem('playerData')
        }
      }

    }
  };
});
