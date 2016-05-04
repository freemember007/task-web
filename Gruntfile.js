module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      basic_and_extras: {
        files: {
          'dist/teamTask.js': [
            'src/app.js',
            'src/*/*.js',
            'src/*/*/*.js',
          ],
          'dist/style.scss': [
            'src/*/*.scss',
            //'src/*/*/*.scss'
          ]
        }
      }
    },
    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'dist/style.css': 'dist/style.scss'
        }
      }
    },
    includereplace: {
      dist: {
        options: {
          // Task-specific options go here.
        },
        src: '*.html',
        dest: 'dist/'
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: '*',
        livereload: 35729
      },
      server: {
        options: {
          open: true, //自动打开网页 http://
          base: [
            './dist' //主目录
          ]
        }
      }
    },
    watch: {
      js: {
        files: ['src/app.js', 'src/*/*.js', 'src/*/*/*.js', 'src/*/*.scss'], //js&scss
        tasks: ['concat']
      },
      sass: {
        files: ['dist/style.scss'],
        tasks: ['sass']
      },
      html: {
        files: ['src/*/*.html', '*.html'],
        tasks: ['includereplace']
      },
      livereload: {
        options: {
          livereload: '<%=connect.options.livereload%>' //监听前面声明的端口  35729
        },
        files: [ //下面文件的改变就会实时刷新网页
          'dist/*.{js,css,html}',
          'img/*.{png,jpg}'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-include-replace');

  // 默认被执行的任务列表。
  grunt.registerTask('default', ['concat', 'sass', 'includereplace', 'connect', 'watch']);

};