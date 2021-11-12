// // Project build type (development or production)
// let isDev = true; // Оставить true для development или заменить на false production версии сборки проекта
// let isProd = !isDev;

// /* 
// Название конечного js-файла для development или production версии сборки 
// Подключить соответствующее имя файла на нужных страницах (например, index.pug или index.html)
// */
// let jsFilename = isDev ? 'main.js' : 'main.min.js';

// /* Webpack options */
// let webpackConfig = {
//     entry: {
//         main: './src/js/index.js', 
//     },
//     output: {
//         filename: jsFilename
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.js$/,
//                 exclude: '/node_modules/', // Не обязательно (для вытягивания откомпелированного в babel кода из зависимостей)
//                 use: {
//                     loader: 'babel-loader',
//                     options: {
//                         presets: ['@babel/preset-env']
//                     }
//                 }
//             }
//         ]
//     },
//     optimization: {
//         minimize: isProd
//     },
//     devServer: {
//         port: 4200,
//         overlay: true, // Вывод ошибки на оверлей на экране
//         open: true // Открытие проекта в браузере при запуске в development режиме
//     },
//     mode: isDev ? 'development' : 'production',
//     devtool: isDev ? 'source-map' : 'none'
// };