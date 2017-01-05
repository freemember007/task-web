angular.module('task.filters', [])
  .filter('jsjson', jsjson)
  .filter('addHost', addHost)
  .filter('urlWrap', urlWrap);

addHost.$inject = [];
function addHost() {
  return function (input) {
    if (input) {
      if (input.indexOf('http') !== -1) {

        return input
      } else {
        // console.log(input)
        return 'http://file.bmob.cn/' + input;
      }
    } else {
      return ''
    }
  };
}

jsjson.$inject = [];
function jsjson() {
  return function (input) {
    if (input) {
      return JSON.parse(input);
    } else {
      return []
    }
  };
}

urlWrap.$inject = [];
function urlWrap() {
  return function (input) {
    if (input) {
      // console.log(input);
      var url = input.match(/(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/);
      if (url){
        return '<a href="' + url + '">' + url + '</a>';
      } else {
        return input;
      }
    }else{
      return '';
    }
  }
}