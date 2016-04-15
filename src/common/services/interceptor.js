angular.module('task.services.interceptor', [])

.factory('Interceptor', ['$rootScope', '$location', function($rootScope, $location) {

  return {
    'request': function(config) {
      // NProgress.start()
      return config;
    },

    'requestError': function(rejection) {
      // NProgress.done()
      return rejection;
    },

    'response': function(res) {
      // NProgress.done()
      return res;
    },

    'responseError': function(res) { //处理HTTP错误
      // NProgress.done()
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