playerApp.controller('playerCtrl', function ($scope) {
  $scope.dataAudio = '';
  var dataForUrlVk = {
    req: 'https://api.vk.com/method/audio.get?access_token=54a52cf42e0570822ba9e8eee7c4aea6ebf2ac89c609d50bef8b3098f5e8473a1ac8fe8a7a788f2cfa2eb',
    method: ['audio.get'],
    client_id: '5381754',
    scope: 'audio,offline',
    token: 'd9cba94e270bd7b0ae796f97c031eba3d15b773e77163410ead9bbac3bb0033fa01c550e9366aea65e786'
  };
  //var url = dataForUrlVk.req + dataForUrlVk.method[0] + '?access_token=' + dataForUrlVk.token + '&callback=JSON_CALLBACK';

  VK.init({
    apiId: '5381754'
  });
});
