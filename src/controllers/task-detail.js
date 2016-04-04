angular.module('task.controllers.taskDetail', [])

.controller('TaskDetailController', [
  '$scope',
  '$rootScope',
  'Task',
  '$timeout',
  'LocalStorage',
  function($scope, $rootScope, Task, $timeout, LocalStorage) {

    $scope.deadlineList = [];
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
        $('#task_detail_container').hide(200);
      })
      $('.submit').click(function() {
        $('.createTask').hide(200);
      })
      $('.toggle_child').click(function() {
        $(this).children('ul').slideToggle(200);
      })
    })


    $scope.$on('PleaseShowTaskDetail', function(event, msg) {
      Task.findOne(msg, function(data) {
        $scope.task = data; //todo:从列表过来的可以不用请求
        $timeout($('#task_detail_container').show(200)); //$timeout 延迟加载，否则没数据
        for (var i = 0; i < 7; i++) { //可选截止日期：从今天开始共14天
          if ($scope.task.deadline && $scope.task.deadline.iso) {
            var date = new Date($scope.task.deadline.iso.replace(/-/g, '/'));
          } else {
            var date = new Date();
          }
          date.setDate(date.getDate() + i);
          $scope.deadlineList[i] = date.toLocaleDateString().replace(/\//g, '-').replace(/-(\d)-/, '-0$1-').replace(/-(\d)$/, '-0$1') + ' 00:00:00';
        }
      })
    })

    $scope.addComment = function(e){
      if($scope.task.newComment && e.keyCode === 13){
        var comment = {
          'userId': $scope.userInfo.objectId,
          'userMsg': $scope.task.newComment,
          'userName': $scope.userInfo.name,
          'userUrl': 'http://file.bmob.cn/' + $scope.userInfo.avatar.url,
          'sendTimg': new Date().toLocaleString()
        };
        $scope.task.comments = $scope.task.comments || [];
        $scope.task.comments.push(comment);
        $scope.updateTask({'comment': comment});
        $scope.task.newComment = '';
      }
    }

    $scope.completeTask = function(e){
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
        console.log(data)
      })
    }

  }
]);