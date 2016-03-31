angular.module('task.controllers.login', [])

  .controller('LoginController', [
    '$scope',
    'User',
    '$state',
    function($scope, User, $state) {

      $scope.user = {
        username: '',
        password: ''
      }

      //登录
      $scope.login = function(params){
        User.login(params, function(data){
          $state.go('main')
        });
      }

    }

  ]);