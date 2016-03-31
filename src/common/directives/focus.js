angular.module('task.directives.focus', [])

.directive('focus', ['$timeout',function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      $timeout(function() {
        element[0].focus();
      }, 500);
    }
  }
}])