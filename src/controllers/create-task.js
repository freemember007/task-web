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
      var H = $(window).height();
      $('.createTask').height(H);

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
        $scope.$emit('CreateFromTaskDetail');
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
      console.log($scope.dateList[i])
    }

  }
]);