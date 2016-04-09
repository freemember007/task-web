angular.module('task.services.notification', [])

.factory('Notification', ['LocalStorage', function(LocalStorage) {

  return {
    find: function(params, callback) {
      Bmob.Cloud.run('notification', params, {
        success: function(data) {
          data = JSON.parse(data);
          callback(data);
        },
        error: function(err) {
          console.log(err);
        }
      })
    },
    check: function(params, callback) {
      Bmob.Cloud.run('notification', params, {
        success: function(data) {
          data = JSON.parse(data);
          callback(data);
        },
        error: function(err) {
          console.log(err);s
        }
      })
    },
    read: function(params, callback) {
      Bmob.Cloud.run('notification', params, {
        success: function(data) {
          data = JSON.parse(data);
          callback(data);
        },
        error: function(err) {
          console.log(err);s
        }
      })
    }
  }
}])