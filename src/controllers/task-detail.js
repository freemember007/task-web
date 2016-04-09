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
      Task.findOne(msg, function(data) {
        $scope.task = data; //todo:从列表过来的可以不用请求
        if ($scope.task.deadline && $scope.task.deadline.iso) {
          var date = new Date($scope.task.deadline.iso.replace(/-/g, '/'));
          $scope.task.deadlineFormat = $scope.formatDeadline(date); //初始值
        } else {
          $scope.task.deadlineFormat = '无期限';
        }
        $timeout($('#task_detail_container').show(200)); //$timeout 延迟加载，否则没数据
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
      })
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
        $scope.$emit('NeedShowTaskList');
        console.log(data);
        if(params.status) { //如果是完成任务和重启任务 todo:改时间不要隐藏详情
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