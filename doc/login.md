## Login

### LoginTab

基于 ant 的 tabs 中 tabPane 来生成 tab 内容

* step1: 生成 Tab Id

```js
const generateId = (() => {
  let i = 0;
  return (prefix = '') => {
    i += 1;
    return `${prefix}${i}`;
  };
})();
```

* step2：调用父组件的 addTab 方法 更新父组件 state 中 `tabs` 的值

```js
  static contextTypes = {
    tabUtil: PropTypes.object,
  };

  componentWillMount() {
    if (this.context.tabUtil) {
      this.context.tabUtil.addTab(this.uniqueId);
    }
  }
```

[component type](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html)

[为什么 React 会检查 element 的$$typeof 属性](http://tech.colla.me/zh/show/why_react_tags_element_with_$$typeof)

* `__ANT_PRO_LOGIN_TAB` 用来标识是否为 Tab 类型
