var gulp = require('gulp');
var    changed = require('gulp-changed');
var    concat = require('gulp-concat');
var    htmlmin = require('gulp-htmlmin');
var    imagemin = require('gulp-imagemin');
var    uglify = require('gulp-uglify');
var    cleanCss = require('gulp-clean-css');
var cache = require('gulp-cached');
var rev = require('gulp-rev');
var replace = require('gulp-replace');
var del = require('del');
var revCollector = require('gulp-rev-collector');

//对常用的东西进行变量化
var dir = './dist';    //对目标根目录进行变量

gulp.task('copyHtml', function(){
    gulp.src('*.html')      //当前目录的HTML文件
    .pipe(cache('copyHtml'))       //只对修改的文件进行复制
    //.pipe(changed(dir))//只有变化的文件能够通过
    // .pipe(htmlmin({collapseWhitespace: true,
    //     removeComments: true
    // }))     //对html文件进行压缩处理，去换行，去注释
    .pipe(replace('a.js','main.js'))        //对html文件中的指定的文字进行替换
    .pipe(gulp.dest(dir));      //复制到目标文件
});

gulp.task('copyCss',function(){
    del([dir+'/css/**/*'],{force: true});   //  由于每次更改css文件，进行hash的话旧的文件就会残留，因此每次写入前需要进行清空。
    gulp.src('css/*.css')
    // .pipe(changed(dir+'/css'))
    .pipe(concat('main.css'))    //对js文件进行合并和重命名
    .pipe(cleanCss({conpatibility: 'ie8'}))     //进行压缩
    .pipe(rev())        //进行hash
    .pipe(gulp.dest(dir+'/css'))        
    .pipe(rev.manifest())       //产生hash对应的json文件
    .pipe(gulp.dest(dir+'/css'));
});

gulp.task('copyJs', function(){
    del([dir+'/js/**/*'],{force: true});    //与css同理删除
    gulp.src('js/*.js')
    .pipe(cache('copyJs'))
    .pipe(concat('main.js'))    //对js文件进行合并和重命名
    .pipe(uglify())        //对合并后的文件进行压缩
    .pipe(rev())
    .pipe(gulp.dest(dir+'/js'))
    .pipe(rev.manifest())
    .pipe(gulp.dest(dir+'/js'));
});

gulp.task('copyImg', function () {
    gulp.src('images/*')
    .pipe(cache('copyImg'))     
    // .pipe(changed(dir+'/img'))
    .pipe(imagemin())   //对图片进行压缩
    .pipe(rev())
    .pipe(gulp.dest(dir+'/images'))
    .pipe(rev.manifest())
    .pipe(gulp.dest(dir+'/images'));
});

gulp.task('rev',function(){
    gulp.src([dir+'/**/*.json', dir+'/*.html'])     //找到json，和目标html文件路径
   .pipe(revCollector({
       replaceReved: true,
       // dirReplacements: {
       //     'a.js':'main.js'
       // }这里主要是对文件路径中的文字进行修改
   }))     //进行替换
   .pipe(gulp.dest(dir));
});

gulp.task('watch',function(){
    console.log('watch.............')
    gulp.watch('*.html', ['copyHtml']);     //监视html文件，如果发生变化就进行复制
    gulp.watch('css/*.css', ['copyCss']);       //监视css文件，如果发生变化就进行复制
    gulp.watch('img/*.{jpg,png}',['copyImg']);      //监视图片，如果发生变化就进行复制
    gulp.watch('js/*.js', ['copyJs']);      //监视js文件，如果发生变化就进行复制
    gulp.watch(dir+'/{**/*.json,/*.html}', ['rev'])     //监视json文件和html文件，如果发生变化就进行hash命名，和引用更改
});

gulp.task('default',['copyHtml','copyCss','copyImg','copyJs','watch']);