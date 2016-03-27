playerApp.directive('player', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/src/partials/player.html',
    scope: {
      props: '='
    },
    link: function (scope) {
      $(".nano").nanoScroller();
      $(".nano").nanoScroller({ sliderMaxHeight: 10 });
    }
  };
});
