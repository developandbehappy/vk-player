playerApp.controller('playerCtrl', function ($scope, $http, $timeout, $window) {
  $scope.dataAudio = '';
  var dataForUrlVk = {
    req: 'https://api.vk.com/method/',
    method: ['audio.get'],
    client_id: '5381754',
    scope: 'audio,offline',
    token: 'd9cba94e270bd7b0ae796f97c031eba3d15b773e77163410ead9bbac3bb0033fa01c550e9366aea65e786'
  };

  //https://oauth.vk.com/access_token
  var authURL = "https://oauth.vk.com/authorize?client_id=" + dataForUrlVk.client_id + "&scope=" + dataForUrlVk.scope + "&redirect_uri=http://oauth.vk.com/blank.html&display=touch&response_type=token&callback=JSON_CALLBACK";

  //chrome.tabs.create({url: authURL, active: true}, function (oauth_tab) {
  //  chrome.tabs.onUpdated.addListener(function loginListener(tab_id, change_info, tab) {
  //    if (tab_id == oauth_tab.id && change_info.url !== undefined && change_info.status === "loading") {
  //      if (change_info.url.indexOf('oauth.vk.com/blank.html#') > -1) {
  //        chrome.tabs.onUpdated.removeListener(loginListener);
  //        var params = change_info.url.substr(change_info.url.indexOf("#") + 1);
  //        params = params.split("&");
  //        console.log('params', params);
  //        for (var i = 0; i < params.length; i++) {
  //          var temp = params[i].split("=");
  //          if (temp[0] == 'error_description') {
  //            user.errorNotify(temp[1]);
  //            chrome.tabs.remove(tab_id, function () {
  //            });
  //            return false;
  //          }
  //
  //          if (temp[0] == 'user_id') {
  //            chrome.storage.sync.set({uid: temp[1]});
  //          }
  //
  //          if (temp[0] == 'access_token') {
  //            chrome.storage.sync.set({token: temp[1]});
  //          }
  //
  //        }
  //
  //        chrome.tabs.remove(tab_id, function () {
  //        });
  //        user.init();
  //      }
  //
  //    }
  //
  //  });
  //});
  //var openWinForGetToken = $window.open(authURL,'_blank');
  //if(openWinForGetToken.closed) {
  //
  //
  //// }
  $http.jsonp(authURL).then(function (res) {
    console.log('res', res);
  });
  var url = dataForUrlVk.req + dataForUrlVk.method[0] + '?access_token=' + dataForUrlVk.token + '&callback=JSON_CALLBACK';

  $http.jsonp(url).success(function (res) {
    $scope.dataAudio = res.response;
  }).finally(function () {
    $timeout(function () {
      $(".nano").nanoScroller();
      $(".nano").nanoScroller({sliderMaxHeight: 10});
      $('input[type="range"]').rangeslider({
        polyfill: false,
        onInit: function () {
          $handle = $('.player-volume-character', this.$range);
        }
      });
    }, 50);
  });
});
