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