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
angular.module('task.filters', [])

.filter('jsjson', function() {
  return function(input) {
    if(input ){
      return JSON.parse(input);
    }else{
      return []
    }
  };
})

.filter('addHost', function() {
  return function(input){
    if(input){
      return 'http://file.bmob.cn/' + input;
    }else{
      return ''
    }
  };
});
angular.module('task.controllers.createTask', [])

.controller('CreatTaskController', [
  '$scope',
  'LocalStorage',
  'Task',
  '$window',
  '$filter',
  '$timeout',
  function($scope, LocalStorage, Task, $window, $filter, $timeout) {

    var now = new Date();
    var oneDay = 24 * 60 * 60 * 1000;
    var weekFormat = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    $scope.filter = $filter; //供模板中的事件函数用
    $scope.userInfo = LocalStorage.getObject('userInfo');
    $scope.companyInfo = LocalStorage.getObject('companyInfo');

    $scope.taskInit = {
      'title': '',
      'company': $scope.companyInfo.objectId,
      'team': $scope.userInfo.team.objectId,
      'assigner': $scope.userInfo.objectId,
      'assignee': $scope.userInfo.objectId,
      'assigneeName': $scope.userInfo.name, //初始值
      'assigneeAvatar': $filter('addHost')($scope.userInfo.avatar.url),
      'costHours': 2,
      'costHoursFormat': '2小时',
      'priority': 0,
      'project': { "name": "其他", "color": "#99999999" },
      'createdAt': $filter('date')(now, 'MM月dd日 HH:mm'),
      'deadline': $filter('date')(now, 'yyyy-MM-dd 00:00:00'), //初始值
      'deadlineFormat': $filter('date')(now, '今天M月d日(') + weekFormat[now.getDay()] + ')', //初始值
      'fileUrl': ''
    };
    $scope.task = {}
    for(var k in $scope.taskInit) $scope.task[k] = $scope.taskInit[k];
    $scope.dateList = [];
    // $scope.priorityList = ['不紧急', '一般', '紧急', '非常紧急'];
    $scope.costHoursObjectList = [
      {'costHours': 2, 'costHoursFormat': '2小时'},
      {'costHours': 4, 'costHoursFormat': '0.5天'},
      {'costHours': 8, 'costHoursFormat': '1天'},
      {'costHours': 12, 'costHoursFormat': '1.5天'},
      {'costHours': 16, 'costHoursFormat': '2天'},
      {'costHours': 20, 'costHoursFormat': '2.5天'},
      {'costHours': 24, 'costHoursFormat': '3天'},
      {'costHours': 32, 'costHoursFormat': '4天'},
      {'costHours': 40, 'costHoursFormat': '5天'}
    ]
    

    // 上传图片
    $scope.upload = function(that){
      var file = that.files[0];
      var name = that.value;
      var file = new Bmob.File(name, file);     
      file.save().then(function(obj) {
        $scope.task.file = { 
          '__type': 'File',
          'filename': that.value,
          'group': 'group1',
          'url': obj.url().replace('http://file.bmob.cn/', '')
        };
        $timeout($scope.task.fileUrl = obj.url());
      }, function(error) {
        console.log(error);
      });
    }

    $(document).ready(function() {
      $("#taskName").focus(function() {
        $(this).css("background-color", "#FFFFCC");
      });
      $("#taskName").blur(function() {
        $(this).css("background-color", "#FFF");
      });
      $('.close').click(function() {
        $('.createTask').hide(200);
      })
      $('.createTask .toggle_child').click(function() {
        $(this).children('ul').slideToggle(200);
      })
    })

    //添加任务
    $scope.createTask = function() {
      if($scope.task.title != ''){
        var task = {}; //构建post参数临时变量
        for(var k in $scope.task) task[k] = $scope.task[k];
        delete task.assigneeName;
        delete task.assigneeAvatar;
        delete task.createdAt;
        delete task.deadlineFormat;
        delete task.costHoursFormat;
        Task.create(task, function(data) {
          console.log(data);
          $scope.task = {};
          for(var k in $scope.taskInit) $scope.task[k] = $scope.taskInit[k];
          $scope.$emit('NeedShowTaskList', {'subject': 'assignee', 'objectId': task.assignee, status: 1}); //todo:回头加参数或调用showSiderbar方法
          $('.createTask').hide(200);
        })
      }
    };

    for (var i = 0; i < 14; i++) { //可选截止日期：从今天开始共14天
      now = new Date(); //每次重新声明下
      var then = new Date();
      then.setDate(then.getDate() + i);
      $scope.dateList[i] = {};
      $scope.dateList[i].deadline = $filter('date')(then, 'yyyy-MM-dd 00:00:00')
      var diff = (then - now) / oneDay;
      var monthAndDate = $filter('date')(then, 'M月d日');
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
    $scope.dateList.unshift({'deadline':'', deadlineFormat:'无期限'})

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
      $scope.login = function(e, user){
        if(e.type == 'click'||e.keyCode == 13){
          User.login(user, function(data){
            $state.go('main')
          });
        }
      }
    }

  ]);
angular.module('task.controllers.sidebar', [])

.controller('SidebarController', [
  '$timeout',
  '$scope',
  '$rootScope',
  'LocalStorage',
  '$state',
  'User',
  'Task',
  function($timeout, $scope, $rootScope, LocalStorage, $state, User, Task) {

    $scope.userInfo = LocalStorage.getObject('userInfo');

    if(!$scope.userInfo.company){
      $state.go('login')
    }

    // 监听TaskUpdate事件
    $scope.$on('TaskCreated', function(event, msg) {
      fetchSidebar();
    })

    $scope.$on('PleaseClickSidebar', function(event, msg) {
      $scope.clickSidebar(msg.subject, msg.objectId, msg.status);
      fetchSidebar();
    })

    //获取左侧菜单栏
    function fetchSidebar() {
      Bmob.Cloud.run('sidebar', {
        companyId: $scope.userInfo.company.objectId,
        userId: $scope.userInfo.objectId
      }, {
        success: function(data) {
          // console.log(data);
          var summaryList = JSON.parse(data);
          $scope.$apply(function() {
            $scope.summaryList = summaryList;
            $timeout(function() {
              $('.teamSummary .icon').click(function() {
                $(this).parent().siblings('.team_group').slideToggle();
                return false;
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

    $scope.clickSidebar = function(subject, objectId, status) {
      console.log($rootScope.currentParams)
      $rootScope.currentParams = { subject: subject, objectId: objectId, status: status||1 };
      $scope.$emit('NeedShowTaskList', $rootScope.currentParams);
    };

  }
]);
angular.module('task.controllers.taskDetail', [])

.controller('TaskDetailController', [
  '$scope',
  '$rootScope',
  'Task',
  '$timeout',
  'LocalStorage',
  '$filter',
  function($scope, $rootScope, Task, $timeout, LocalStorage, $filter) {

    $scope.dateList = [];
    $scope.priorityList = ['不紧急', '一般紧急', '紧急', '非常紧急'];
    $scope.userInfo = LocalStorage.getObject('userInfo');
    $scope.companyInfo = LocalStorage.getObject('companyInfo');

    $(document).ready(function() {
      $(".taskNameInput").focus(function() {
        $(".taskNameInput").css("background-color", "#FFFFCC");
      });
      $(".taskNameInput").blur(function() {
        $(".taskNameInput").css("background-color", "#FFF");
      });
      $('.icon_close').click(function() {
        $rootScope.currentTaskDetailId = '';
        $timeout($('#task_detail_container').hide(200))
      })

      $('#task_detail_container .toggle_child').click(function() {
        $(this).children('ul').slideToggle(200);
      })
    })


    $scope.$on('PleaseShowTaskDetail', function(event, msg) {
      // Task.findOne(msg, function(data) {
        $scope.task = msg.task; //todo:从列表过来的可以不用请求
        if ($scope.task.deadline && $scope.task.deadline.iso) {
          var date = new Date($scope.task.deadline.iso.replace(/-/g, '/'));
          $scope.task.deadlineFormat = $scope.formatDeadline(date); //初始值
        } else {
          $scope.task.deadlineFormat = '无期限';
        }
        $timeout($('#task_detail_container').show(200)) //$timeout 延迟加载，否则没数据
        $timeout($('#task_detail').scrollTop(0)) //0必须加
        $rootScope.currentTaskDetailId = $scope.task.objectId;
        
        for (var i = 0; i < 14; i++) { //可选截止日期：从今天开始共14天
          $scope.dateList[i] = {};
          var date = new Date();
          date.setDate(date.getDate() + i);
          date.setHours(0);
          date.setMinutes(0);
          date.setSeconds(0);
          date.setMilliseconds(0);
          $scope.dateList[i].deadline = $filter('date')(date, 'yyyy-MM-dd 00:00:00');
          $scope.dateList[i].deadlineFormat = $scope.formatDeadline(date);
        }
        $scope.dateList.unshift({'deadline':'', deadlineFormat:'无期限'}) //todo:保存是无法清空时间,请求服务端支持
      // })
    })

    $scope.addComment = function(e){
      if($scope.task.newComment && e.keyCode === 13){
        var comment = {
          'userId': $scope.userInfo.objectId,
          'userMsg': $scope.task.newComment,
          'userName': $scope.userInfo.name,
          'userUrl': $filter('addHost')($scope.userInfo.avatar.url),
          'sendTimg': (new Date()).getTime() //存毫秒数，方便解析，不能用各种toString()
        };
        $scope.task.comments = $scope.task.comments || [];
        $scope.task.comments.push(comment);
        $scope.updateTask({'comment': comment});
        $scope.task.newComment = '';
      }
    }

    $scope.addCheck = function(e){
      if($scope.task.newCheck && e.keyCode === 13){
        $scope.task.checklist.push({'item':$scope.task.newCheck, 'complete':'1'});
        $scope.updateTask({'checklist': $scope.task.checklist});
        $scope.task.newCheck = '';
      }
    }


    $scope.alterTitle = function(e){
      if($scope.task.title && e.keyCode === 13){
        $scope.updateTask({'title': $scope.task.title});
        $(".taskNameInput").blur();
      }
    }

    $scope.updateTask = function(params) {
      var postData = angular.extend(params);
      postData.objectId = $scope.task.objectId;
      postData.updaterId = $scope.userInfo.objectId;
      Task.update(postData, function(data) {
        // $scope.$emit('NeedShowTaskList');
        console.log(data);
        if(params.status !== undefined) { //如果是完成任务和重启任务 todo:改时间不要隐藏详情
          $scope.getTaskList(); //直接调用父controller方法
          $('#task_detail_container').hide(200);
          $rootScope.currentTaskDetailId = '';
        }
      })
    }

    $scope.formatDeadline = function(date){ //后续考虑做成指令
      var now = new Date();
      now.setHours(0);
      now.setMinutes(0);
      now.setSeconds(0);
      now.setMilliseconds(0);
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      var oneDay = 24 * 60 * 60 * 1000;
      var weekFormat = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      var diff = (date - now) / oneDay;
      var monthAndDate = $filter('date')(date, 'M月d日');
      var week = weekFormat[date.getDay()];
      if (diff === 2) {
        return '后天' + monthAndDate + ('(' + week + ')');
      } else if (diff === 0) {
        return '今天' + monthAndDate + ('(' + week + ')');
      } else if (diff === 1) {
        return '明天' + monthAndDate + ('(' + week + ')');
      } else { //diff >1 && diff < 7
        return monthAndDate + week
      }
    }

  }
]);
angular.module('task.controllers.taskList', [])

.controller('TaskListController', [
  '$scope',
  '$rootScope',
  '$timeout',
  '$location',
  'LocalStorage',
  'Task',
  'User',
  'Notification',
  function($scope, $rootScope, $timeout, $location, LocalStorage, Task, User, Notification) {

    //变量声明
    $scope.myself = false;
    $scope.doing = false;
    $scope.done = false;
    $scope.userInfo = LocalStorage.getObject('userInfo');
    $rootScope.currentParams = { //当前任务列表参数，todo: 回头这种参数得清理或重构，太晕
      'subject': 'assignee',
      'objectId': $scope.userInfo.objectId,
      'status': 1
    };
    $scope.allTaskList = []; // 所有任务
    $scope.taskList = []; // 当前Tab任务
    $scope.length = []; // 任务数
    $scope.progressList = [
      {'percent': '---', 'style': 'transparent transparent transparent transparent'},
      {'percent': '25', 'style': 'transparent #008000 transparent transparent'},
      {'percent': '50', 'style': 'transparent #008000 #008000 transparent'},
      {'percent': '75', 'style': 'transparent #008000 #008000 #008000'},
    ]

    //jquery动画
    $(document).ready(function() {
      $('.add_task').click(function() {
        $('.createTask').show(200);
        $("#taskName").focus();
      })
      $('.close').click(function() {
        $('.j_slide_layer').hide(200);
      })
    })

    //极端丑陋...
    $scope.showProgressList = function(e){
        $(e.target).parent().children('ul').slideToggle(200);
        e.stopPropagation();
    }
    $scope.hideProgressList = function(e){
      $(e.target).parent().parent().hide(200);
      e.stopPropagation();
    }

    // 监听PleaseShowTaskList事件
    $scope.$on('PleaseShowTaskList', function(event, msg) {
      $scope.getTaskList(msg);
    })

    //通知相关
    $scope.checkNotification = function(){
      console.log('start check');
      Notification.check({
        'action': 'check',
        'userId': $scope.userInfo.objectId
      }, function(data){
        if(data.count == 0){
          $timeout($scope.unreadNotificationNumber = '');
          $timeout($scope.showNotificationNumber = false);
        }else{
          $timeout($scope.showNotificationNumber = true);
          $timeout($scope.unreadNotificationNumber = data.count);
        } 
      })
    }
    $scope.readAllNotification = function(){
      Notification.read({
        'action': 'readAll', 
        'userId': $scope.userInfo.objectId
      }, function(data){
        // console.log(data);
        $timeout($scope.unreadNotificationNumber = '');
        $timeout($scope.showNotificationNumber = false);
        for(var i = 0; i < $scope.notifications.length; i++){
          $scope.notifications[i].isRead = true;
        }
        setTimeout(function(){$('.notification_container').hide()}, 500);
      });
    }
    $scope.findNotification = function() {
      $('.notification_container').toggle(200)
      Notification.find({
        'action': 'find', 
        'userId': $scope.userInfo.objectId
      }, function(data){
          $timeout($scope.notifications = data);
          // $timeout($('.notification_container').toggle(200));
      })
    }
    $scope.clickNotification = function(params) {
      $('.notification_container').hide();
      Notification.read({
        'action': 'read', 
        'notificationId': params.notificationId
      }, function(data){
        console.log(data)
      });
      $scope.getTaskList({'subject': params.subject, 'objectId': params.objectId, 'status': params.status, 'taskId': params.taskId});
      $scope.checkNotification();
    }

    // 任务列表相关
    $scope.getTaskList = function(params) {
      if (params) { //如果是主动点击
        $('#task_detail_container').hide(200);
        $rootScope.currentTaskDetailId = '';
      }
      params = params || $rootScope.currentParams;
      params.userId = $scope.userInfo.objectId;
      Task.find(params, function(data) {
        $scope.allTaskList = data;
        setLength();
        $scope.$apply(function() {
          $scope.filterTaskList(params.status, null, params.taskId);
          delete params.taskId; // 丑陋
          $timeout($rootScope.currentParams = params);
          if(params.subject == 'assignee' && params.objectId == $scope.userInfo.objectId){
            $scope.myself =  true;
          }else{
            $scope.myself = false;
          }
        });
      })
    }

    $scope.filterTaskList = function(p, $event, taskId) {

      if($event){ //如果是主动点击
        $('#task_detail_container').hide(200);
        $rootScope.currentTaskDetailId = '';
      }
      $scope.taskList = $scope.allTaskList[p];
      $rootScope.currentParams.status = p;
      if(p == 2){
        $scope.done =  true;
        $scope.doing = false;
      }else if(p == 1){
        $scope.doing = true;
        $scope.done =  false;
      }else{
        $scope.doing = false;
        $scope.done =  false;
      }
      $timeout($('.right').scrollTop(0));
      if(taskId){
        for(var i=0; i<$scope.taskList.length; i++){
          // console.log($scope.taskList[i])
          for(var j=0; j<$scope.taskList[i].tasks.length; j++){
            if($scope.taskList[i].tasks[j].objectId == taskId){
              $scope.showTaskDetail($scope.taskList[i].tasks[j]);
            }
          }
        }
      }
    }

    function setLength() { //太丑陋，回头让服务端支持
      $scope.allTaskList.forEach(function(value, index) {
        var length = 0;
        value.forEach(function(v) {
          length += v.tasks.length;
        })
        $scope.length[index] = length;
      })
    }

    // 更新任务
    $scope.updateTask = function(params) {
      var postData = angular.extend(params);
      postData.updaterId = $scope.userInfo.objectId;
      Task.update(postData, function(data) {
        $scope.getTaskList();
        // console.log(data)
      })
    }

    // 打开任务详情
    $scope.showTaskDetail = function(task) {
      if($rootScope.currentTaskDetailId === task.objectId){
        $('#task_detail_container').hide(200);
        $rootScope.currentTaskDetailId = '';
      }else{
        $scope.$broadcast('PleaseShowTaskDetail', { 'task': task });
      }
    }

    //退出
    $scope.logout = function() {
      User.logout()
    }

    //初始化
    $scope.getTaskList();
    setTimeout($scope.checkNotification, 300)
    setInterval($scope.checkNotification, 30000);

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
angular.module('task.services.notification', [])

.factory('Notification', ['LocalStorage', function(LocalStorage) {

  return {
    find: function(params, callback) {
      Bmob.Cloud.run('notification', params, {
        success: function(data) {
          // console.log(data);
          data = JSON.parse(data);
          callback(data);
        },
        error: function(err) {
          console.log(err);
        }
      })
    },
    check: function(params, callback) {
      Bmob.Cloud.run('notification', params, {
        success: function(data) {
          data = JSON.parse(data);
          callback(data);
        },
        error: function(err) {
          console.log(err);
        }
      })
    },
    read: function(params, callback) {
      Bmob.Cloud.run('notification', params, {
        success: function(data) {
          data = JSON.parse(data);
          callback(data);
        },
        error: function(err) {
          console.log(err);
        }
      })
    },
    readAll: function(params, callback) {
      Bmob.Cloud.run('notification', params, {
        success: function(data) {
          data = JSON.parse(data);
          callback(data);
        },
        error: function(err) {
          console.log(err);
        }
      })
    }
  }
}])
angular.module('task.services.task', [])

.factory('Task', ['LocalStorage', function(LocalStorage) {

  return {
    find: function(params, callback) {
      Bmob.Cloud.run('taskList', params, {
        success: function(data) {
          // console.log(data);
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
          console.log(data);
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