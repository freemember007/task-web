angular.module('task.services.task', [])

.factory('Task', ['LocalStorage', function(LocalStorage) {

  return {
    find: function(params, callback) {
      Bmob.Cloud.run('taskList', params, {
        success: function(data) {
          data = JSON.parse(data);
          LocalStorage.setObject('taskList', data);
          callback(data);
        },
        error: function(err) {
          console.log(err);
        }
      })
    },
    findOne: function(params, callback) {
      Bmob.Cloud.run('taskDetail', params, {
        success: function(data) {
          data = JSON.parse(data);
          callback(data);
        },
        error: function(err) {
          console.log(err);
        }
      })
    },
    update: function(params, callback) {
      Bmob.Cloud.run('updateTask', params, {
        success: function(data) {
          console.log(params)
          data = JSON.parse(data);
          callback(data);
        },
        error: function(err) {
          console.log(err);
        }
      })
    },
    create: function(params, callback) {
      Bmob.Cloud.run('createTask', params, {
        success: function(data) {
          data = JSON.parse(data);
          callback(data);
        },
        error: function(err) {
          console.log(err)
        }
      })
    }

  };
}])