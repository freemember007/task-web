angular.module('task.controllers.taskList', [])

  .controller('TaskListController', [
    '$timeout',
    '$scope',
    '$location',
    'LocalStorage',
    'Task',
    'User',
    function($timeout, $scope, $location, LocalStorage, Task, User) {

      $scope.userInfo = LocalStorage.getObject('userInfo');
      var currentParams = { 'subject': 'assignee', 'objectId': $scope.userInfo.objectId }; //当前任务列表参数

      $(document).ready(function(){
        var H=$(window).height();
        var W=$(window).width();

        $('.task_container').height(H);
        $('.createTask').height(H);
        var w=$('.left').width();
        $('.right').width(W-w);
        $('.main').height(H-120).width($('.right').width()-20);

        $('.left_container').height(H-79);

        $('.menu li').click(function(){
          $(this).siblings().removeClass('active');
          $(this).addClass('active');
        })
        $('.taskList').width($('.taskList').width()+20);
        
        $('.addTask').click(function(){
          $('.createTask').show(200);
          $("#taskName").focus(); 
        })

      })

      $scope.allTaskList = []; // 所有任务
      $scope.taskList = []; // 当前Tab任务
      $scope.length = []; // 任务数
      $scope.myself = true; // 当前任务列表是否我负责的
      $scope.done = false; // 当前任务是否完成

      // 监听SidebarClicked事件
      $scope.$on('SidebarClicked', function(event, msg) {
        $scope.getTaskList(msg);
      })

      // 监听TaskCreated事件
      $scope.$on('TaskCreated', function(event, msg) {
        $scope.getTaskList(msg);
      })

      // 获取任务列表方法
      $scope.getTaskList = function(params) {
        $scope.done = false;
        params = params || currentParams;
        Task.find(params, function(data) {
        	$scope.myself = params.subject === 'assignee' && params.objectId === 'EuGz444d' ? true : false;
          $scope.allTaskList = data;
          setLength();
          console.log($scope.allTaskList);
          $scope.$apply(function() {
            $scope.taskList = $scope.allTaskList[1];
            currentParams = params;
          });
          $('.menu li').removeClass('active');
          $('#default').addClass('active');
        })
      }

      //初始化任务列表
      $scope.getTaskList();


      //完成任务
      $scope.completeTask = function(objectId){
        Task.update({updaterId: $scope.userInfo.objectId, objectId: objectId, status: 2}, function(data){
          $scope.getTaskList({ 'subject': 'assignee', 'objectId': 'EuGz444d' });
          console.log(data);
        })
      }

      $scope.logout = function(){
        User.logout()
      }


      $scope.filterTaskList = function(p) {
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
    }
  ]);