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
    $scope.userInfo = LocalStorage.getObject('userInfo');
    $scope.currentParams = { //当前任务列表参数
      'subject': 'assignee',
      'objectId': $scope.userInfo.objectId,
      'status': 1
    };
    $scope.allTaskList = []; // 所有任务
    $scope.taskList = []; // 当前Tab任务
    $scope.length = []; // 任务数
    $scope.myself = true; // 当前任务列表是否我负责的
    $scope.done = false; // 当前任务是否完成

    //jquery动画
    $(document).ready(function() {
      $('.add_task').click(function() {
        $('.createTask').show(200);
        $("#taskName").focus();
      })
    })

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
          $scope.unreadNotificationNumber = ''
          $scope.showNotificationNumber = false;
        }else{
          $scope.showNotificationNumber = true;
          $scope.unreadNotificationNumber = data.count;
        } 
      })
    }
    $scope.findNotification = function() {
      Notification.find({
        'action': 'find', 
        'userId': $scope.userInfo.objectId
      }, function(data){
          $scope.notifications = data;
          $timeout($('.notification_container').toggle(200));
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
      // $scope.getTaskList({'subject': params.subject, 'objectId': params.objectId, 'status': params.status});
      $scope.$emit('NeedClickSidebar', {'subject': params.subject, 'objectId': params.objectId, 'status': params.status});
      $scope.$emit('NeedShowTaskDetail', { 'taskId': params.taskId });
      $rootScope.currentTaskDetailId = params.taskId;
      $scope.checkNotification();

    }

    // 任务列表相关
    $scope.getTaskList = function(params) {
      if (params) { //如果是主动点击
        $('#task_detail_container').hide(200);
        $rootScope.currentTaskDetailId = '';
      }
      $scope.done = false;
      params = params || $scope.currentParams;
      params.userId = $scope.userInfo.objectId;
      Task.find(params, function(data) {
        $scope.myself = params.subject === 'assignee' && params.objectId === $scope.userInfo.objectId ? true : false;
        $scope.allTaskList = data;
        setLength();
        $scope.$apply(function() {
          $scope.filterTaskList(params.status);
          $timeout($scope.currentParams = params)
        });
      })
    }

    $scope.filterTaskList = function(p,$event) {
      if($event){ //如果是主动点击
        $('#task_detail_container').hide(200);
        $rootScope.currentTaskDetailId = '';
      }
      $scope.currentParams.status = p;
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
    $scope.showTaskDetail = function(taskId) {
      if(taskId === $rootScope.currentTaskDetailId){
        $('#task_detail_container').hide(200);
        $rootScope.currentTaskDetailId = '';
      }else{
        $scope.$emit('NeedShowTaskDetail', { 'taskId': taskId });
        $rootScope.currentTaskDetailId = taskId;
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