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
        console.log(data);
        $timeout($scope.unreadNotificationNumber = '');
        $timeout($scope.showNotificationNumber = false);
        for(var i = 0; i < $scope.notifications.length; i++){
          $scope.notifications[i].isRead = true;
        }
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
      if(params.subject == 'assignee' && params.objectId == $scope.userInfo.objectId){
        $scope.myself =  true;
      }else{
        $scope.myself = false;
      }
      params.userId = $scope.userInfo.objectId;
      Task.find(params, function(data) {
        $scope.allTaskList = data;
        setLength();
        $scope.$apply(function() {
          $scope.filterTaskList(params.status, null, params.taskId);
          delete params.taskId; // 丑陋
          $timeout($rootScope.currentParams = params);
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
          console.log($scope.taskList[i])
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
        console.log(data)
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
    $scope.checkNotification();
    setInterval($scope.checkNotification, 30000);

  }
]);