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
      $scope.login = function(e, user){
        if(e.type == 'click'||e.keyCode == 13){
          User.login(user, function(data){
            $state.go('main')
          });
        }
      }
    }

  ]);