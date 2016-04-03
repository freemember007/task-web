angular.module('teamTask', [
  'ui.router',
  'ngAnimate',
  'task.controllers.login',
  'task.controllers.sidebar',
  'task.controllers.taskList',
  'task.controllers.createTask',
  'task.controllers.taskDetail',
  'task.services.localStorage',
  'task.services.interceptor',
  'task.services.user',
  'task.services.task',
  'task.directives.focus'
])

// 编译
.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$httpProvider',
  function($stateProvider, $urlRouterProvider, $httpProvider) {

    $httpProvider.interceptors.push('Interceptor');

    // $urlRouterProvider.otherwise("/login");

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
  function($rootScope, $state, LocalStorage) {

    // Bmob Sdk 初始化
    Bmob.initialize("5d447ad3a22ca5a70ec26ca01a9f5176", "8a010f08c229de9b811d3a86a3b24c1b");

    // 事件转发，注意接收名和转发名不能一样，否则陷入死循环
    $rootScope.$on('NeedShowTaskList', function(event, msg) {
      $rootScope.$broadcast("PleaseShowTaskList", msg); // 
    })

    $rootScope.$on('NeedShowTaskDetail', function(event, msg) {
      $rootScope.$broadcast("PleaseShowTaskDetail", msg); // 
    })

    // 判断登录状态，跳到不同页面
    if (LocalStorage.getObject('userInfo').objectId) {
      $state.go('main');
    } else {
      $state.go('login');
    };

  }
]);
angular.module('task.controllers.createTask', [])

.controller('CreatTaskController', [
  '$scope',
  'LocalStorage',
  'Task',
  '$window',
  function($scope, LocalStorage, Task, $window) {

    var now = new Date();
    var oneDay = 24 * 60 * 60 * 1000;
    var weekFormat = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    $scope.userInfo = LocalStorage.getObject('userInfo');
    $scope.companyInfo = LocalStorage.getObject('companyInfo');
    $scope.task = {
      'title': '',
      'company': $scope.companyInfo.objectId,
      'team': $scope.userInfo.team.objectId,
      'assigner': $scope.userInfo.objectId,
      'assignee': $scope.userInfo.objectId,
      'assigneeName': $scope.userInfo.name, //初始值
      'assigneeAvatar': 'http://file.bmob.cn/' + $scope.userInfo.avatar.url,
      'costHours': 2,
      'priority': 0,
      'project': { "name": "其他", "color": "#99999999" },
      'createdAt': (now.getMonth() + 1) + '月' + now.getDate() + '日',
      'deadline': now.toLocaleDateString().replace(/\//g, '-').replace(/-(\d)-/, '-0$1-').replace(/-(\d)$/, '-0$1') + ' 00:00:00', //初始值
      'deadlineFormat': '今天' + (now.getMonth() + 1) + '月' + now.getDate() + '日' + '(' + weekFormat[now.getDay()] + ')', //初始值
    };
    $scope.dateList = [];
    // $scope.priorityList = ['不紧急', '一般', '紧急', '非常紧急'];

    $(document).ready(function() {

      $("#taskName").focus(function() {
        $("#taskName").css("background-color", "#FFFFCC");
      });
      $("#taskName").blur(function() {
        $("#taskName").css("background-color", "#FFF");
      });
      $('.close').click(function() {
        $('.createTask').hide(200);
      })
      $('.submit').click(function() {
        $('.createTask').hide(200);
      })
      $('.projectName').click(function() {
        $('.projectList').slideToggle(200);
      })
      $('.assigneeName').click(function() {
        $('.assigneeList').slideToggle(200);
      })
      $('.deadline').click(function() {
        $('.dateList').slideToggle(200);
      })
      $('.priority').click(function() {
        $('.priorityList').slideToggle(200);
      })
    })

    //添加任务
    $scope.createTask = function() {
      var task = {}; //构建post参数临时变量
      for(var k in $scope.task) task[k] = $scope.task[k];
      delete task.assigneeName;
      delete task.assigneeAvatar;
      delete task.createdAt;
      delete task.deadlineFormat;
      Task.create(task, function(data) {
        console.log(data);
        $scope.$emit('NeedShowTaskList');
        // $window.location.reload()
      })
    };

    for (var i = 0; i < 14; i++) { //可选截止日期：从今天开始共14天
      now = new Date(); //每次重新声明下
      var then = new Date();
      then.setDate(then.getDate() + i);
      $scope.dateList[i] = {};
      $scope.dateList[i].deadline = then.toLocaleDateString().replace(/\//g, '-').replace(/-(\d)-/, '-0$1-').replace(/-(\d)$/, '-0$1') + ' 00:00:00';
      var diff = (then - now) / oneDay;
      var monthAndDate = (then.getMonth() + 1) + '月' + then.getDate() + '日';
      var week = weekFormat[then.getDay()];
      if (diff === 2) {
        $scope.dateList[i].deadlineFormat = '后天' + monthAndDate + ('(' + week + ')');
      } else if (diff === 0) {
        $scope.dateList[i].deadlineFormat = '今天' + monthAndDate + ('(' + week + ')');
      } else if (diff === 1) {
        $scope.dateList[i].deadlineFormat = '明天' + monthAndDate + ('(' + week + ')');
      } else { //diff >1 && diff < 7
        $scope.dateList[i].deadlineFormat = monthAndDate + week
      }
    }

  }
]);
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
angular.module('task.controllers.sidebar', [])

.controller('SidebarController', [
  '$timeout',
  '$scope',
  'LocalStorage',
  'User',
  'Task',
  function($timeout, $scope, LocalStorage, User, Task) {

    $scope.userInfo = LocalStorage.getObject('userInfo');
    $scope.currentParams = {};

    // 监听TaskUpdate事件
    $scope.$on('TaskCreated', function(event, msg) {
      fetchSidebar();
    })

    //获取左侧菜单栏
    function fetchSidebar() {
      Bmob.Cloud.run('sidebar', {
        companyId: $scope.userInfo.company.objectId,
        userId: $scope.userInfo.objectId
      }, {
        success: function(data) {
          var summaryList = JSON.parse(data);
          console.log(summaryList);
          $scope.$apply(function() {
            $scope.summaryList = summaryList;
            $timeout(function() {
              $('.teamSummary .icon').click(function() {
                $(this).parent().siblings('.team_group').slideToggle();
              })
            }, 200);
          })
        },
        error: function(err) {
          console.log(err);
        }
      })
    }

    fetchSidebar();

    $scope.clickSidebar = function(subject, objectId) {
      console.log($scope.currentParams)
      $scope.currentParams = { subject: subject, objectId: objectId };
      $scope.$emit('NeedShowTaskList', $scope.currentParams);
    };

  }
]);
angular.module('task.controllers.taskDetail', [])

.controller('TaskDetailController', [
  '$scope',
  'Task',
  '$timeout',
  function($scope, Task, $timeout) {

    $scope.showTaskDetail = false;
    $scope.task = {};
    $scope.dateList = [];

    $scope.$on('PleaseShowTaskDetail', function(event, msg) {
      Task.findOne(msg, function(data) {
        console.log(data)
        $scope.task = data; //todo:从列表过来的可以不用请求
        $timeout($('#task_detail_container').show(200)); //$timeout 延迟加载，否则没数据
        for (var i = 0; i < 14; i++) { //可选截止日期：从今天开始共14天
          if ($scope.task.deadline && $scope.task.deadline.iso) {
            var date = new Date($scope.task.deadline.iso.replace(/-/g, '/'));
          } else {
            var date = new Date();
          }
          date.setDate(date.getDate() + i);
          $scope.dateList[i] = date.toLocaleDateString().replace(/\//g, '-').replace(/-(\d)-/, '-0$1-').replace(/-(\d)$/, '-0$1') + ' 00:00:00';
        }
      })
    })

  }
]);
angular.module('task.controllers.taskList', [])

  .controller('TaskListController', [
    '$timeout',
    '$scope',
    '$location',
    'LocalStorage',
    'Task',
    'User',
    function($timeout, $scope, $location, LocalStorage, Task, User) {

      $scope.userInfo = LocalStorage.getObject('userInfo');
      var currentParams = { 'subject': 'assignee', 'objectId': $scope.userInfo.objectId }; //当前任务列表参数

      $(document).ready(function(){

        $('.menu li').click(function(){
          $(this).siblings().removeClass('active');
          $(this).addClass('active');
        })
        
        $('.add_task').click(function(){
          $('.createTask').show(200);
          $("#taskName").focus(); 
        })

      })

      $scope.showTaskDetail = function(taskId){
        $scope.$emit('NeedShowTaskDetail', {'taskId': taskId});
      }

      $scope.allTaskList = []; // 所有任务
      $scope.taskList = []; // 当前Tab任务
      $scope.length = []; // 任务数
      $scope.myself = true; // 当前任务列表是否我负责的
      $scope.done = false; // 当前任务是否完成

      // 监听PleaseShowTaskList事件
      $scope.$on('PleaseShowTaskList', function(event, msg) {
        $scope.getTaskList(msg);
      })

      // 监听TaskCreated事件
      // $scope.$on('TaskCreated', function(event, msg) {
      //   $scope.getTaskList(msg);
      // })

      // 获取任务列表方法
      $scope.getTaskList = function(params) {
        $scope.done = false;
        params = params || currentParams;
        Task.find(params, function(data) {
        	$scope.myself = params.subject === 'assignee' && params.objectId === 'EuGz444d' ? true : false;
          $scope.allTaskList = data;
          setLength();
          console.log($scope.allTaskList);
          $scope.$apply(function() {
            $scope.taskList = $scope.allTaskList[1];
            currentParams = params;
          });
          $('.menu li').removeClass('active');
          $('#default').addClass('active');
        })
      }

      //初始化任务列表
      $scope.getTaskList();


      //完成任务
      $scope.completeTask = function(objectId){
        Task.update({updaterId: $scope.userInfo.objectId, objectId: objectId, status: 2}, function(data){
          $scope.getTaskList({ 'subject': 'assignee', 'objectId': 'EuGz444d' });
          console.log(data);
        })
      }

      $scope.logout = function(){
        User.logout()
      }


      $scope.filterTaskList = function(p) {
        $scope.taskList = $scope.allTaskList[p];
        if (p == 2) {
          $scope.done = true;
        } else {
          $scope.done = false;
        }
      }

      function setLength() {
        $scope.allTaskList.forEach(function(value, index) {
          var length = 0;
          value.forEach(function(v) {
            length += v.tasks.length;
          })
          $scope.length[index] = length;
        })
      }
    }
  ]);
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
angular.module('task.services.interceptor', [])

.factory('Interceptor', ['$rootScope', '$location', function($rootScope, $location) {

  return {
    'request': function(config) {
      NProgress.start()
      return config;
    },

    'requestError': function(rejection) {
      NProgress.done()
      return rejection;
    },

    'response': function(res) {
      NProgress.done()
      return res;
    },

    'responseError': function(res) { //处理HTTP错误
      NProgress.done()
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
angular.module('task.services.localStorage',[])


//--------- 本地存储 ---------//
.factory('LocalStorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    remove: function(key) {
      return $window.localStorage.removeItem(key);
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    clear: function(){
      $window.localStorage.clear();
    }
  }
}])
angular.module('task.services.task', [])

.factory('Task', ['LocalStorage', function(LocalStorage) {

  return {
    find: function(params, callback) {
      Bmob.Cloud.run('taskList', params, {
        success: function(data) {
          data = JSON.parse(data);
          LocalStorage.setObject('taskList', data);
          callback(data);
        },
        error: function(err) {
          console.log(err);
        }
      })
    },
    findOne: function(params, callback) {
      Bmob.Cloud.run('taskDetail', params, {
        success: function(data) {
          data = JSON.parse(data);
          callback(data);
        },
        error: function(err) {
          console.log(err);
        }
      })
    },
    update: function(params, callback) {
      Bmob.Cloud.run('updateTask', params, {
        success: function(data) {
          data = JSON.parse(data);
          callback(data);
        },
        error: function(err) {
          console.log(err);
        }
      })
    },
    create: function(params, callback) {
      Bmob.Cloud.run('createTask', params, {
        success: function(data) {
          data = JSON.parse(data);
          callback(data);
        },
        error: function(err) {
          console.log(err)
        }
      })
    }

  };
}])
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