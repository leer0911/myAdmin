# 基础配置

该教程仅适用于 `"dva": "^2.1.0"`

## step1

```bash
// dva 初始化项目
dva new admin

// 安装 antd design 、 按需加载
npm install antd babel-plugin-import --save

// 安装 decorators 支持
npm install --save-dev babel-plugin-transform-decorators-legacy
```

## step2

dva 2 开始 webpack 配置在 `.webpackrc` 文件，这里修改为 js 的格式 `.webpackrc.js`

相关配置如下：

```JavaScript
const path = require('path');

export default {
  entry: 'src/index.js',
  extraBabelPlugins: [
    'transform-decorators-legacy', // decorators 支持
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }] // antd 按需加载
  ],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr']
    }
  },
  alias: {
    components: path.resolve(__dirname, 'src/components/')
  },
  ignoreMomentLocale: true,
  theme: './src/theme.js', // 主题修改文件
  html: {
    template: './src/index.ejs'
  },
  publicPath: '/',
  disableDynamicImport: true,
  hash: true
};
```

在 src 目录下新建 `theme.js` 和 `index.ejs` 文件

主题修改格式为：

```JavaScript
// https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
module.exports = {
  // 'primary-color': '#10e99b',
  'card-actions-background': '#f5f8fa',
};
```
