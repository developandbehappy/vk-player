playerApp.controller('playerCtrl', function ($scope, $http, $timeout, $window, $interval) {
  $scope.dataAudio = '';
  var dataForUrlVk = {
    req: 'https://api.vk.com/method/',
    method: ['audio.get'],
    client_id: '5381754',
    scope: 'audio,offline',
    token: 'd9cba94e270bd7b0ae796f97c031eba3d15b773e77163410ead9bbac3bb0033fa01c550e9366aea65e786'
  };


  VK.init({
    apiId: '5381754'
  });
});
