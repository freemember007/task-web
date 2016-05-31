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
            'src/{app,common}/*.js',
            'src/{app,common}/**/*.js'
          ],
          'build/js/lib.js': [
            'bower_components/angular/angular.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/jquery/dist/jquery.js',
            'bower_components/nprogress/nprogress.js',
            'src/lib/*.js'
          ],
          'build/css/style.css': [
            'bower_components/nprogress/nprogress.css',
            'build/css/style.css'
          ]
        }
      }
    },

    includereplace: {
      build: {
        files: [
          {expand: true, flatten: true, cwd: 'src/', src: 'app/*/*.html', dest: 'build/html/'}
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

    uglify: {
      release: {
        options: {
          // report: 'gzip'
        },
        files: [
          {expand: true, cwd: 'build/js', src: ['*.js'], dest: 'release/js', ext: '.js'}
        ]
      }
    },
    cssmin: {
      release: {
        files: [
          {expand: true, cwd: 'build/css', src: ['*.css'], dest: 'release/css', ext: '.css'}
        ]
      }
    },

    cacheBust: {
      options: {
        baseDir: 'release/',
        assets: ['*/*.{js,css,png,jpg,gif,ico,eot,svg,ttf,woff}'],
        queryString: true,
        length: 8
      },
      release: {
        files: [{
          cwd: 'release/',
          src: ['index.html', 'css/style.css', 'js/templates.js']
        }]
      }
    },

    connect: {
      options: {
        port: 9000,
        hostname: '*',
        livereload: 35729
      },
      build: {
        options: {
          open: true,
          base: [
            './build' //主目录
          ]
        }
      },
      release: {
        options: {
          open: true,
          base: [
            './release' //主目录
          ]
        }
      }
    },

    watch: {
      sass: {
        files: ['src/**/*.scss'],
        tasks: ['sass']
      },
      concat: {
        files: ['src/**/*.js', 'src/css/style.css'],
        tasks: ['concat']
      },
      includereplace: {
        files: ['src/**/*.html'],
        tasks: ['includereplace']
      },
      html2js: {
        files: ['build/html/*.html'],
        tasks: ['html2js']
      },
      copy: {
        files: ['src/index.html', 'src/{fonts,img}/*.*'],
        tasks: ['copy']
      },
      livereload: {
        options: {
          livereload: '<%=connect.options.livereload%>' //监听前面声明的端口  35729
        },
        files: [ //下面文件的改变就会实时刷新网页
          '{build,release}/**'
        ]
      }
    },

    // clean
    clean: {
      options: {
        'no-write': false
      },
      build: ['build'],
      release: ['release']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-include-replace');
  grunt.loadNpmTasks('grunt-common-html2js');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-cache-bust');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('build', ['copy:build', 'concat', 'sass', 'includereplace', 'html2js', 'connect:build', 'watch']);
  grunt.registerTask('release', ['copy:release', 'uglify', 'cssmin', 'cacheBust', 'connect:release', 'watch']);

};