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
      var file;
      file = that.files[0];
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