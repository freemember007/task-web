angular.module('task.controllers.taskList',  [])
  .controller('TaskListController', TaskListController);

TaskListController.$inject = ['$scope', '$rootScope', '$timeout', 'LocalStorage', 'Task', 'User', 'Notification', '$filter'];
function TaskListController($scope, $rootScope, $timeout, LocalStorage, Task, User, Notification, $filter) {

  //变量声明
  $scope.myself = false;
  $scope.doing = false;
  $scope.done = false;
  $scope.userInfo = LocalStorage.getObject('userInfo');
  $scope.companyInfo = LocalStorage.getObject('companyInfo');
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
  var count = count; //考核统计
  
  //初始化
  $scope.getTaskList();
  setTimeout($scope.checkNotification, 300);
  setInterval($scope.checkNotification, 600000);

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
    $scope.valueTask = task;
    $scope.valueCache = task.value;
    $('.valueModal').show(200);
    e.stopPropagation();
  }
  
  function doValue(params){
    $('.valueModal').hide(200);
    updateTask(params);
    $scope.valueTask = {};
    $scope.valueCache = '';
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
    countSaturation(params);
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

  function count(params) {
    $scope.countObj = {
      costHoursThisMonth: 0,
      delayNum: 0,
      fiveStar: 0,
      currentSaturation: 0
    };

    var BmobTask = Bmob.Object.extend('task');
    var query = new Bmob.Query(BmobTask);
    //本月1日
    var thisMonthBegin = new Date();
    thisMonthBegin.setDate(1);
    thisMonthBegin.setHours(0,0,0,0); // todo: 受时区影响,可能并不是凌晨00:00,而是中午12:00?
    //下月1日
    var nextMonthBegin = new Date();
    nextMonthBegin.setMonth(nextMonthBegin.getMonth() + 1);
    nextMonthBegin.setDate(1);
    nextMonthBegin.setHours(0,0,0,0); 

    query.select('costHours', 'deadline', 'completedAt', 'value', 'priority');
    query.equalTo(params.subject, params.objectId); //当前任务人
    query.equalTo('status', 2); //已完成
    query.greaterThanOrEqualTo('completedAt', thisMonthBegin.getTime()); // 从本月初
    query.lessThan('completedAt', nextMonthBegin.getTime()); // 到下月初
    query.find().then(function (results) {
      for (var i = 0; i < results.length; i++) {
        var task = results[i];
        // 总工时
        $scope.countObj.costHoursThisMonth += task.get('costHours') || 0;
        // 当前饱和度
        if(i === results.length - 1){
          var now = new Date();
          $scope.countObj.currentSaturation = $scope.countObj.costHoursThisMonth/(now.getDate()*5)*100;
        }
        // 逾期数
        var completedAt = $filter('date')(task.get('completedAt'), 'yyyy/MM/dd 00:00:00'); //注意:此格式起不到置0的作用
        completedAt = new Date(completedAt);
        completedAt.setHours(0,0,0,0);
        var deadline = task.get('deadline').replace(/-/g, '/');
        deadline = new Date(deadline);
        deadline.setHours(0,0,0,0);
        if (completedAt > deadline) {
          // console.log(completedAt+'\n');
          // console.log(deadline+'\n\n');
          if(task.get('priority') != 2){
            $scope.countObj.delayNum++;
          }else{
            $scope.countObj.delayNum = $scope.countObj.delayNum + 2;
          }
        }

        // 五星数
        var value = task.get('value') || 3; // 任务评分
        var priorityFactor = (task.get('priority') == 1 || task.get('priority') == 3) ? 2 : 1; //优先级影响因子
        $scope.countObj.fiveStar += (value - 3)/2 * priorityFactor; //五星级统计
      }
    });
  }

  // 计算未来饱和度
  function countSaturation(params) {
    $scope.totalCostHoursThisWeek = 0;
    var BmobTask = Bmob.Object.extend('task');
    var query = new Bmob.Query(BmobTask);
    //本周一
    // var thisWeekStart = new Date();
    // thisWeekStart.setDate(thisWeekStart.getDay() == 0 ? thisWeekStart.getDate() - 6 : thisWeekStart.getDate() - (thisWeekStart.getDay() - 1));
    // thisWeekStart.setHours(0,0,0,0);
    //本周日
    // var thisWeekEnd = new Date();
    // thisWeekEnd.setDate(thisWeekEnd.getDay() == 0 ? thisWeekEnd.getDate() : thisWeekEnd.getDate() + (7 - thisWeekEnd.getDay()));
    //一周开始,今天
    var thisWeekStart = new Date();
    thisWeekStart.setHours(0,0,0,0);
    //一周结束,6天后
    var thisWeekEnd = new Date();
    thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
    thisWeekEnd.setHours(0,0,0,0);
    query.select('costHours', 'deadline', 'createdAt');
    query.equalTo(params.subject, params.objectId); //当前任务人
    query.equalTo('status', 1); //进行中的任务
    query.greaterThanOrEqualTo('deadline', thisWeekStart); // 截止日期大于或等于本周一
    query.find().then(function (results) {
      for (var i = 0; i < results.length; i++) {
        var task = results[i];
        //任务开始时间
        var createdAt = task.createdAt.replace(/-/g, '/');
        createdAt = new Date(createdAt);
        createdAt.setHours(0,0,0,0);
        //任务结束时间
        var deadline = task.get('deadline').replace(/-/g, '/');
        deadline = new Date(deadline);
        deadline.setHours(0,0,0,0);
        // 本周一减任务开始日的天数
        var startDaysDiff = (thisWeekStart.getTime() - createdAt.getTime())/(24*60*60*1000);
        // 任务结束日减本周日的天数
        var endDaysDiff = (deadline.getTime() - thisWeekEnd.getTime())/(24*60*60*1000);
        // 任务在本周的天数
        var costDaysThisWeek = 7 + (startDaysDiff < 0 ? startDaysDiff : 0) + (endDaysDiff < 0 ? endDaysDiff : 0);
        // 任务总天数
        var costDays = (deadline.getTime() - createdAt.getTime())/(24*60*60*1000) + 1; //注意:算上当天,故要加一天
        // 任务总耗时
        var costHours = task.get('costHours');
        // 任务在本周的耗时
        var costHoursThisWeek = costHours/costDays*costDaysThisWeek;
        // console.log(task.get('title')+'\n');
        // console.log(costDays+'days\n');
        // console.log(costDaysThisWeek+'days\n');
        // console.log(costHoursThisWeek+'hours\n');
        $scope.totalCostHoursThisWeek += costHoursThisWeek;
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