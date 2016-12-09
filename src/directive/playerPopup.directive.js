playerApp.directive('playerPopup', function ($timeout, $interval, $http) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/src/partials/player.html',
    scope: {},
    link: function (scope) {
      var port = chrome.extension.connect();

      var interval = '';
      var intervalCutName = '';
      var currentAudio = [];
      var audioList = [];
      var token = localStorage.getItem('playerToken');
      var playerId = $('#player');
      var playerLogoWrapper = $(".player-logo-wrapper");
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

      setInterval(function () {
        port.postMessage({name: "give me all setting"});
      }, 300);
      port.onMessage.addListener(function (msg) {
        if (msg.name === 'all setting') {
          scope.curAudio = msg.val;
          rangeVolume.val(scope.curAudio.volume).change();
          scope.$apply();
        }
      });

      getAudio();
      playerId.css({
        'background-image': 'url(' + scope.curAudio.photo_author + ')'
      });
      playerLogo.css({
        'background': 'url(' + scope.curAudio.photo_author + ') no-repeat center center'
      });

      scope.logout = function () {
        scope.props = [];
        scope.auth = false;
        port.postMessage({name: "logout"});
      };

      scope.login = function () {
        port.postMessage({name: "login"});
        port.onMessage.addListener(function (msg) {
          if (msg.name === 'login get data') {
            scope.props = msg.data;
            scope.auth = true;
            scope.$apply();
            init();
          }
        });
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
        port.postMessage({name: "pause and play"});
      };


      scope.mute = function () {
        port.postMessage({name: "mute", mute: scope.curAudio.volume});
      };


      scope.changeVolume = function () {
        port.postMessage({name: "change volume", status: scope.curAudio.volume});
      };

      scope.startAudio = function (audioItem) {
        port.postMessage({name: "start audio", audio: audioItem});
        addActiveClassItem(audioItem);
      };

      scope.nextPlay = function (status) {
        port.postMessage({name: "next play", status: status});
        var indexPlay = 0;

        if (!_.isEmpty(scope.curAudio.src)) {
          _.each(scope.props, function (item, index) {
            if (item.url === scope.curAudio.src) {
              indexPlay = index;
            }
          });
        } else {
          var localStorageData = saveAndGetDataFromLocalStorage('read');
          if (localStorageData) {
            localStorageData = JSON.parse(localStorageData);
            _.each(scope.props, function (item, index) {
              if (item.artist === localStorageData.author && item.duration === localStorageData.duration) {
                indexPlay = index;
              }
            });
          } else {
            indexPlay = 0;
          }
        }
        if (status) {
          indexPlay++;
        } else {
          indexPlay--;
        }
        if (indexPlay < 0) {
          indexPlay = _.size(scope.props) - 1;
        } else if (indexPlay > _.size(scope.props) - 1 && indexPlay > 0) {
          indexPlay = 0;
        }
        changeScrollPosition(indexPlay);
        addActiveClassItem(scope.props[indexPlay]);
      };


      scope.loop = function () {
        if (!currentAudio) {
          return false
        }
        scope.curAudio.loop = !scope.curAudio.loop;
        port.postMessage({name: "loop", status: scope.curAudio.loop});

      };

      scope.downloadCurAudio = function () {
        var curAudio = currentAudio;
        var link = document.createElement('a');
        link.setAttribute('href', curAudio.src);
        link.setAttribute('download', 'download');
        link.click();
      };

      playerLogoWrapper.mousemove(function (e) {
        if (e.target.className === 'player-logo') {
          return false;
        }
        if (e.which == 1) {
          setPosMusic(e, this);
        }
      });
      playerLogoWrapper.click(function (e) {
        if (e.target.className === 'player-logo') {
          return false;
        }
        setPosMusic(e, this);
      });


      function setPosMusic(e, self) {
        var parentOffset = $(self).parent().offset();
        var relY = e.pageY - parentOffset.top;
        var relX = e.pageX - parentOffset.left;
        port.postMessage({name: "change pos music", x: relX, y: relY});
      }

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
        port.postMessage({name: "get audio list"});
        port.onMessage.addListener(function (msg) {
          if (msg.name === 'audio list') {
            scope.props = msg.data;
            if (_.size(scope.props)) scope.auth = true;
            scope.$apply();
            $timeout(function () {
              init();
            }, 100);
          }
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
