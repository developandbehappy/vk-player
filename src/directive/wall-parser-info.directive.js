playerApp.directive('wallParserInfo', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/src/partials/wall-parser/wall-parser-info.html',
        scope: {
            link: '=',
            params: '='
        },
        link: function (scope) {

        }
    };
});