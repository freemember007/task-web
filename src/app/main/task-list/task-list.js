angular.module('task.controllers.taskList',  [])
  .controller('TaskListController', TaskListController);

TaskListController.$inject = ['$scope', '$rootScope', '$timeout', 'LocalStorage', 'Task', 'User', 'Notification', '$filter'];
function TaskListController($scope, $rootScope, $timeout, LocalStorage, Task, User, Notification, $filter) {

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
  ];
  $scope.valueList = ['1', '0', '-1'];
  $scope.valueTask = {};
  $scope.checkNotification = checkNotification;
  $scope.showProgressList = showProgressList;
  $scope.hideProgressList = hideProgressList;
  $scope.readAllNotification = readAllNotification;
  $scope.findNotification = findNotification;
  $scope.clickNotification = clickNotification;
  $scope.getTaskList = getTaskList;
  $scope.filterTaskList = filterTaskList;
  $scope.updateTask = updateTask;
  $scope.showTaskDetail = showTaskDetail;
  $scope.showValueModal = showValueModal;
  $scope.doValue = doValue;
  $scope.logout = logout;
  
  //初始化
  $scope.getTaskList();
  setTimeout($scope.checkNotification, 300);
  setInterval($scope.checkNotification, 60000);

  // 监听PleaseShowTaskList事件
  $scope.$on('PleaseShowTaskList', function (event, msg) {
    $scope.getTaskList(msg);
  });

  //jquery动画
  $(document).ready(function () {
    $('.add_task').click(function () {
      $('.createTask').show(200);
      $("#taskName").focus();
    });
    $('.close').click(function () {
      $('.j_slide_layer').hide(200);
    })
  });


  function showValueModal(e, task) {
    $('.valueModal').show(200);
    $scope.valueTask = task;
    $scope.valueCache = task.value;
    e.stopPropagation();
  }
  
  function doValue(params){
    $('.valueModal').hide(200);
    updateTask(params);
  }

  //极端丑陋...
  function showProgressList(e) {
    $(e.target).parent().children('ul').slideToggle(200);
    e.stopPropagation();
  }

  function hideProgressList(e) {
    $(e.target).parent().parent().hide(200);
    e.stopPropagation();
  }

  //通知相关
  function checkNotification(){
    Notification.check({
      'action': 'check',
      'userId': $scope.userInfo.objectId
    }, function (data) {
      if (data.count == 0) {
        $timeout($scope.unreadNotificationNumber = '');
        $timeout($scope.showNotificationNumber = false);
      } else {
        $timeout($scope.showNotificationNumber = true);
        $timeout($scope.unreadNotificationNumber = data.count);
      }
    })
  }

  function readAllNotification() {
    Notification.read({
      'action': 'readAll',
      'userId': $scope.userInfo.objectId
    }, function (data) {
      $timeout($scope.unreadNotificationNumber = '');
      $timeout($scope.showNotificationNumber = false);
      for (var i = 0; i < $scope.notifications.length; i++) {
        $scope.notifications[i].isRead = true;
      }
      setTimeout(function () {
        $('.notification_container').hide()
      }, 500);
    });
  }

  function findNotification() {
    $('.notification_container').toggle(200)
    Notification.find({
      'action': 'find',
      'userId': $scope.userInfo.objectId
    }, function (data) {
      $timeout($scope.notifications = data);
      // $timeout($('.notification_container').toggle(200));
    })
  }

  function clickNotification(params) {
    $('.notification_container').hide();
    Notification.read({
      'action': 'read',
      'notificationId': params.notificationId
    }, function (data) {
    });
    $scope.getTaskList({
      'subject': params.subject,
      'objectId': params.objectId,
      'status': params.status,
      'taskId': params.taskId
    });
    $scope.checkNotification();
  }

  // 任务列表相关
  function getTaskList(params) {
    if (params) { //如果是主动点击
      $('#task_detail_container').hide(200);
      $rootScope.currentTaskDetailId = '';
    }
    params = params || $rootScope.currentParams;
    params.userId = $scope.userInfo.objectId; //发起数据请求的人
    Task.find(params, function (data) {
      $scope.allTaskList = data;
      setLength();
      $scope.$apply(function () {
        $scope.filterTaskList(params.status, null, params.taskId);
        delete params.taskId; // 丑陋
        $timeout($rootScope.currentParams = params);
        $scope.myself = !!(params.subject == 'assignee' && params.objectId == $scope.userInfo.objectId);
      });
    });
    count(params);
  }

  function filterTaskList(p, $event, taskId) {
    if ($event) { //如果是主动点击
      $('#task_detail_container').hide(200);
      $rootScope.currentTaskDetailId = '';
    }
    $scope.taskList = $scope.allTaskList[p];
    $rootScope.currentParams.status = p;
    if (p == 2) {
      $scope.done = true;
      $scope.doing = false;
    } else if (p == 1) {
      $scope.doing = true;
      $scope.done = false;
    } else {
      $scope.doing = false;
      $scope.done = false;
    }
    $timeout($('.right').scrollTop(0));
    if (taskId) {
      for (var i = 0; i < $scope.taskList.length; i++) {
        for (var j = 0; j < $scope.taskList[i].tasks.length; j++) {
          if ($scope.taskList[i].tasks[j].objectId == taskId) {
            $scope.showTaskDetail($scope.taskList[i].tasks[j]);
          }
        }
      }
    }
  }

  function setLength() { //太丑陋，回头让服务端支持
    $scope.allTaskList.forEach(function (value, index) {
      var length = 0;
      value.forEach(function (v) {
        length += v.tasks.length;
      });
      $scope.length[index] = length;
    })
  }

  // 任务计数
  function count(params) {
    $scope.countObj = {
      costHoursThisMonth: 0,
      delayNum: 0
    };
    var BmobTask = Bmob.Object.extend('task');
    var query = new Bmob.Query(BmobTask);
    var now = new Date();
    now.setDate(1);
    var then;
    then = $filter('date')(now, 'yyyy-MM-dd 00:00:00');
    query.select('title', 'costHours', 'isDelay');
    query.equalTo(params.subject, params.objectId);
    query.greaterThanOrEqualTo('createdAt', {'__type': 'Date', 'iso': then});
    query.find().then(function (results) {
      for (var i = 0; i < results.length; i++) {
        $scope.countObj.costHoursThisMonth += results[i].get('costHours') || 0;
        if (results[i].get('isDelay')) {
          $scope.countObj.delayNum++
        }
      }
    });
  }

  // 更新任务
  function updateTask(params) {
    var postData = angular.extend(params);
    postData.updaterId = $scope.userInfo.objectId;
    Task.update(postData, function (data) {
      $scope.getTaskList();
    })
  }

  // 打开任务详情
  function showTaskDetail(task) {
    if ($rootScope.currentTaskDetailId === task.objectId) {
      $('#task_detail_container').hide(200);
      $rootScope.currentTaskDetailId = '';
    } else {
      $scope.$broadcast('PleaseShowTaskDetail', {task: task});
    }
  }

  //退出
  function logout() {
    User.logout();
  }

}