angular.module('task.controllers.sidebar', [])

.controller('SidebarController', [
  '$timeout',
  '$scope',
  'LocalStorage',
  'User',
  'Task',
  function($timeout, $scope, LocalStorage, User, Task) {

    $scope.userInfo = LocalStorage.getObject('userInfo');
    $scope.currentParams = {};

    // 监听TaskUpdate事件
    $scope.$on('TaskCreated', function(event, msg) {
      fetchSidebar();
    })

    $scope.$on('PleaseClickSidebar', function(event, msg) {
      $scope.clickSidebar(msg.subject, msg.objectId, msg.status);
      fetchSidebar();
    })

    //获取左侧菜单栏
    function fetchSidebar() {
      Bmob.Cloud.run('sidebar', {
        companyId: $scope.userInfo.company.objectId,
        userId: $scope.userInfo.objectId
      }, {
        success: function(data) {
          var summaryList = JSON.parse(data);
          // console.log(summaryList);
          $scope.$apply(function() {
            $scope.summaryList = summaryList;
            $timeout(function() {
              $('.teamSummary .icon').click(function() {
                $(this).parent().siblings('.team_group').slideToggle();
                return false;
              })
            }, 200);
          })
        },
        error: function(err) {
          console.log(err);
        }
      })
    }

    fetchSidebar();

    $scope.clickSidebar = function(subject, objectId, status) {
      console.log($scope.currentParams)
      $scope.currentParams = { subject: subject, objectId: objectId, status: status||1 };
      $scope.$emit('NeedShowTaskList', $scope.currentParams);
    };

  }
]);