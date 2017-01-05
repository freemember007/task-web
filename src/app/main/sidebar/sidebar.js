angular.module('task.controllers.sidebar', [])
.controller('SidebarController', [
  '$timeout',
  '$scope',
  '$rootScope',
  'LocalStorage',
  '$state',
  'User',
  function($timeout, $scope, $rootScope, LocalStorage, $state, User) {

    $scope.userInfo = LocalStorage.getObject('userInfo'); //个人信息
    var user = LocalStorage.getObject('user'); //登录信息
    $scope.summaryList = LocalStorage.getObject('summaryList') || []; //本地缓存
    $scope.clickSidebar = clickSidebar;
    $scope.toggleTeam = toggleTeam;

    if (!$scope.userInfo.name  || !user.username) {
      $state.go('login')
    } else {
      User.login(LocalStorage.getObject('user'), function(data) { // 每次重新登录下
        if(!data){
          $state.go('login');
          return;
        }
        console.log('login twice ok!')
      });
    }

    // 初始化
    fetchSidebar();
    $rootScope.currentToggleTeamId = $scope.userInfo.team.objectId;

    // 监听TaskUpdate事件
    $scope.$on('TaskCreated', function(event, msg) {
      // fetchSidebar();
    });

    $scope.$on('PleaseClickSidebar', function(event, msg) {
      $scope.clickSidebar(msg.subject, msg.objectId, msg.status);
      // fetchSidebar();
    });


    //获取左侧菜单栏
    function fetchSidebar() {
      Bmob.Cloud.run('sidebar', {
        companyId: $scope.userInfo.company.objectId,
        userId: $scope.userInfo.objectId
      }, {
        success: function(data) {
          var summaryList = JSON.parse(data);
          if(summaryList.mySummary){ //如果取到正常数据
            $scope.$apply(function() {
              $scope.summaryList = summaryList;
              LocalStorage.setObject('summaryList', $scope.summaryList);
            })
          }
        },
        error: function(err) {
          // console.log(err);
        }
      })
    }

    function clickSidebar(subject, objectId, status) {
      // console.log($rootScope.currentParams);
      $rootScope.currentParams = {subject: subject, objectId: objectId, status: status || 1};
      $scope.$emit('NeedShowTaskList', $rootScope.currentParams);
    }

    function toggleTeam(teamId) {
      $rootScope.currentToggleTeamId = $rootScope.currentToggleTeamId == teamId ? '' : teamId;
    }

  }
]);
