angular.module('task.services.user', [])

.factory('User', ['LocalStorage', '$state', function(LocalStorage, $state) {

  return {
    login: function(params, callback) {
      Bmob.Cloud.run('login', {
        username: params.username,
        password: params.password
      }, {
        success: function(data) {
          data = JSON.parse(data);
          if(data.code){
            alert(data.error)
          }else{
            LocalStorage.setObject('userInfo', data.userInfo);
            LocalStorage.setObject('companyInfo', data.companyInfo);
            callback(data);
          }
          
        },
        error: function(err) {
          alert('登录错误，请重试！')
          location.href = 'login.html';
        }
      })
    },
    logout: function(){
      LocalStorage.remove('userInfo');
      LocalStorage.clear(); //todo: 貌似不生效
      $state.go('login');
    }
  };
}])