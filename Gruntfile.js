module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    sass: {
      build: {
        options: {
          noCache: true,
          quiet: true
        },
        files: {
          'build/css/style.css': 'src/scss/style.scss'
        }
      }
    },

    concat: {
      build: {
        files: {
          'build/js/app.js': [
            'src/{ui,common}/*.js',
            'src/{ui,common}/**/*.js'
          ],
          'build/js/lib.js': [
            'bower_components/angular/angular.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/jquery/dist/jquery.js',
            'bower_components/nprogress/nprogress.js',
            'src/lib/*.js'
          ],
          'build/css/style.css': [
            'build/css/style.css',
            'bower_components/nprogress/nprogress.css'
          ]
        }
      }
    },

    includereplace: {
      build: {
        files: [
          {expand: true, flatten: true, cwd: 'src/', src: 'ui/*/*.html', dest: 'build/html/'}
        ]
      }
    },
    
    html2js: {
      build: {
        src: ['build/html/*.html'],
        dest: 'build/js/templates.js'
      }
    },

    copy: {
      build: {
        files: [
          {expand: true, cwd: 'src', src: ['{fonts,img}/*', 'index.html'], dest: 'build'}
        ]
      },
      release: {
        files: [
          {expand: true, cwd: 'build', src: ['{fonts,img}/*', 'index.html'], dest: 'release'}
        ]
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
          open: true,
          base: [
            './build'
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
          '{build,release}/**'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-include-replace');
  grunt.loadNpmTasks('grunt-common-html2js');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');


  // 默认被执行的任务列表。
  grunt.registerTask('build', ['sass', 'concat', 'includereplace', 'html2js', 'copy:build', 'connect', 'watch']);

};