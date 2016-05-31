angular.module('task.services.localStorage',[])


//--------- 本地存储 ---------//
.factory('LocalStorage', ['$window', '$state', function($window, $state) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    remove: function(key) {
      return $window.localStorage.removeItem(key);
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      // if(!$window.localStorage[key] || $window.localStorage[key] == 'undefined'){
      //   $state.go('login');
      // }
      return JSON.parse($window.localStorage[key] || '{}');
    },
    clear: function(){
      $window.localStorage.clear();
    }
  }
}])