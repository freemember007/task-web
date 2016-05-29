angular.module('task.controllers.login', [])

  .controller('LoginController', function ($scope, User, $state, LocalStorage) {

    $scope.user = {
      username: '',
      password: ''
    };

    //登录
    $scope.login = function (e, user) {
      if (e.type == 'click' || e.keyCode == 13) {
        User.login(user, function (data) {
          LocalStorage.setObject('user', user);
          $state.go('main')
        });
      }
    }

  });
