angular.module('task.services.interceptor', [])

.factory('Interceptor', ['$rootScope', '$location', function($rootScope, $location) {

  return {
    'request': function(config) {
      console.log('/---请求:\n');
      console.log(config.data);
      console.log('------/\n\n\n');
      return config;

    },

    'requestError': function(rejection) {
      return rejection;
    },

    'response': function(res) {
      console.log('/---响应\n');
      console.log(res);
      console.log('------/\n\n\n');
      return res;

    },

    'responseError': function(res) { //处理HTTP错误
      var status = res.status;
      if (status === 0) {
        alert('网络异常！请检查您的网络连接！');
      } else if (status === 404) {
        alert('请求的资源不存在！');
        $location.path('/notFound')
      } else if (status === 500) {
        alert('服务器内部错误！');
        $location.path('/error')
      } else {
        alert('HTTP错误：' + status);
      }
    }
  };
}]);