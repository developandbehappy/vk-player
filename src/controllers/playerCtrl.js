playerApp.controller('playerCtrl', function ($scope, $http) {
  $scope.dataAudio = '';
  var dataForUrlVk = {
    req: 'https://api.vk.com/method/',
    method: ['audio.get'],
    token: '2b58094b9415c44531ef2f09fd94263abdd705394cc9d4dd9e74334e54999002243188c07533b6a7aa47c'
  };

  var url = dataForUrlVk.req + dataForUrlVk.method[0] + '?access_token=' + dataForUrlVk.token + '&callback=JSON_CALLBACK';

  $http.jsonp(url).success(function (res) {
    $scope.dataAudio = res.response;
    //var response = res.response;
    //$scope.dataAudio = response;
    //console.log('$scope.dataAudio', $scope.dataAudio);
  });
});
