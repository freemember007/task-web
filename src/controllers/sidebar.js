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

    //获取左侧菜单栏
    function fetchSidebar() {
      Bmob.Cloud.run('sidebar', {
        companyId: $scope.userInfo.company.objectId,
        userId: $scope.userInfo.objectId
      }, {
        success: function(data) {
          var summaryList = JSON.parse(data);
          console.log(summaryList);
          $scope.$apply(function() {
            $scope.summaryList = summaryList;
            $timeout(function() {
              $('.teamSummary .icon').click(function() {
                $(this).parent().siblings('.team_group').slideToggle();
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

    $scope.clickSidebar = function(subject, objectId) {
      console.log($scope.currentParams)
      $scope.currentParams = { subject: subject, objectId: objectId };
      $scope.$emit('ClickFromSidebar', $scope.currentParams);
    };

  }
]);