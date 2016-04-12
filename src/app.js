angular.module('teamTask', [
  'ui.router',
  'task.controllers.login',
  'task.controllers.sidebar',
  'task.controllers.taskList',
  'task.controllers.createTask',
  'task.controllers.taskDetail',
  'task.services.localStorage',
  'task.services.interceptor',
  'task.services.user',
  'task.services.task',
  'task.services.notification',
  'task.directives.focus',
  'task.filters',
  'angularFileUpload'
])

// 编译
.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$httpProvider',
  function($stateProvider, $urlRouterProvider, $httpProvider) {
    
    $httpProvider.interceptors.push('Interceptor');

    $stateProvider
      .state('main', {
        url: "/main",
        templateUrl: "main.html"
      })
      .state('login', {
        url: "/login",
        templateUrl: "login.html"
      });

  }
])

// 运行
.run([
  '$rootScope',
  '$state',
  'LocalStorage',
  '$timeout',
  function($rootScope, $state, LocalStorage, $timeout) {

    // Bmob Sdk 初始化
    Bmob.initialize("5d447ad3a22ca5a70ec26ca01a9f5176", "8a010f08c229de9b811d3a86a3b24c1b");

    // 事件转发，注意接收名和转发名不能一样，否则陷入死循环
    $rootScope.$on('NeedClickSidebar', function(event, msg) {
      $rootScope.$broadcast("PleaseClickSidebar", msg); // 
    })
    
    $rootScope.$on('NeedShowTaskList', function(event, msg) {
      $rootScope.$broadcast("PleaseShowTaskList", msg); // 
    })

    $rootScope.globalStatus = {
      showDetail: false,
    }

    $rootScope.currentParams = {};

    $rootScope.currentTaskDetailId = ''; //全局当前任务ID

    //jquery动画
    $(document).ready(function() {
      $(document).keydown(function(e){
        if(e.keyCode == 27){
          $rootScope.currentTaskDetailId = '';
          $timeout($('.j_slide_layer').hide(200));
        }
      })
    })

    // 判断登录状态，跳到不同页面
    if (LocalStorage.getObject('userInfo').objectId) {
      $state.go('main');
    } else {
      $state.go('login');
    };

  }
]);