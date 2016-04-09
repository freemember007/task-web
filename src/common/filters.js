angular.module('task.filters', [])

.filter('jsjson', function() {
  return function(input) {
    if(input ){
      return JSON.parse(input);
    }else{
      return []
    }
  };
})

.filter('addHost', function() {
  return function(input){
    if(input){
      return 'http://file.bmob.cn/' + input;
    }else{
      return ''
    }
  };
});