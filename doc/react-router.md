# ReactRouter

[中文文档](https://github.com/react-guide/react-router-cn)

## 简介

### JSX 语法格式

```JSX
React.render((
  <Router>
    <Route path="/" component={App}>
      <Route path="about" component={About} />
      <Route path="inbox" component={Inbox} />
    </Route>
  </Router>
), document.body)
```

### JavaScript 格式

```JavaScript
const routes = {
  path: '/',
  component: App,
  childRoutes: [
    { path: 'about', component: About },
    { path: 'inbox', component: Inbox },
  ]
}

React.render(<Router routes={routes} />, document.body)
```

### 获取 URL 参数

为了从服务器获取 message 数据，我们首先需要知道它的信息。当渲染组件时，React Router 会自动向 Route 组件中注入一些有用的信息，尤其是路径中动态部分的参数。

```JavaScript
const Message = React.createClass({

  componentDidMount() {
    // 来自于路径 `/inbox/messages/:id`
    const id = this.props.params.id

    fetchMessage(id, function (err, message) {
      this.setState({ message: message })
    })
  },

  // ...

})
```

## 基础

### 路由配置

#### 添加首页

想象一下当 URL 为 `/` 时，我们想渲染一个在 `App` 中的组件。不过在此时，`App` 的 `render` 中的 `this.props.children` 还是 `undefined`。这种情况我们可以使用 [`IndexRoute`](/docs/API.md#indexroute) 来设置一个默认页面。

```js
import { IndexRoute } from 'react-router';

const Dashboard = React.createClass({
  render() {
    return <div>Welcome to the app!</div>;
  }
});

render(
  <Router>
    <Route path="/" component={App}>
      {/* 当 url 为/时渲染 Dashboard */}
      <IndexRoute component={Dashboard} />
      <Route path="about" component={About} />
      <Route path="inbox" component={Inbox}>
        <Route path="messages/:id" component={Message} />
      </Route>
    </Route>
  </Router>,
  document.body
);
```

#### 让 UI 从 URL 中解耦出来

如果我们可以将 `/inbox` 从 `/inbox/messages/:id` 中去除，并且还能够让 `Message` 嵌套在 `App -> Inbox` 中渲染，那会非常赞。绝对路径可以让我们做到这一点。

```js
render(
  <Router>
    <Route path="/" component={App}>
      <IndexRoute component={Dashboard} />
      <Route path="about" component={About} />
      <Route path="inbox" component={Inbox}>
        {/* 使用 /messages/:id 替换 messages/:id */}
        <Route path="/messages/:id" component={Message} />
      </Route>
    </Route>
  </Router>,
  document.body
);
```

在多层嵌套路由中使用绝对路径的能力让我们对 URL 拥有绝对的掌控。我们无需在 URL 中添加更多的层级，从而可以使用更简洁的 URL。

**提醒**：绝对路径可能在动态路由中无法使用。

#### 兼容旧的 URL

等一下，我们刚刚改变了一个 URL! 现在任何人访问 `/inbox/messages/5` 都会看到一个错误页面。:(

不要担心。我们可以使用 `<Redirect>` 使这个 URL 重新正常工作。

```js
import { Redirect } from 'react-router';

render(
  <Router>
    <Route path="/" component={App}>
      <IndexRoute component={Dashboard} />
      <Route path="about" component={About} />
      <Route path="inbox" component={Inbox}>
        <Route path="/messages/:id" component={Message} />

        {/* 跳转 /inbox/messages/:id 到 /messages/:id */}
        <Redirect from="messages/:id" to="/messages/:id" />
      </Route>
    </Route>
  </Router>,
  document.body
);
```

现在当有人点击 `/inbox/messages/5` 这个链接，他们会被自动跳转到 `/messages/5`。 :raised_hands:

#### 进入和离开的 Hook

Route 可以定义 `onEnter` 和 `onLeave` 两个 hook ，这些 hook 会在页面跳转时触发一次。这些 hook 对于一些情况非常的有用，例如权限验证或者在路由跳转前将一些数据持久化保存起来。

在路由跳转过程中，`onLeave` hook 会在所有将离开的路由中触发，从最下层的子路由开始直到最外层父路由结束。然后`onEnter` hook 会从最外层的父路由开始直到最下层子路由结束。

继续我们上面的例子，如果一个用户点击链接，从 `/messages/5` 跳转到 `/about`，下面是这些 hook 的执行顺序：

* `/messages/:id` 的 `onLeave`
* `/inbox` 的 `onLeave`
* `/about` 的 `onEnter`

### 路由匹配原理

路由拥有三个属性来决定是否“匹配“一个 URL：

1.  嵌套关系
2.  路径语法
3.  优先级

### 嵌套关系

React Router 使用路由嵌套的概念来让你定义 view 的嵌套集合，当一个给定的 URL 被调用时，整个集合中（命中的部分）都会被渲染。嵌套路由被描述成一种树形结构。React Router 会深度优先遍历整个路由配置来寻找一个与给定的 URL 相匹配的路由。

### 路径语法

路由路径是匹配一个（或一部分）URL 的 一个字符串模式。大部分的路由路径都可以直接按照字面量理解，除了以下几个特殊的符号：

* `:paramName` – 匹配一段位于 `/`、`?` 或 `#` 之后的 URL。 命中的部分将被作为一个参数
* `()` – 在它内部的内容被认为是可选的
* `*` – 匹配任意字符（非贪婪的）直到命中下一个字符或者整个 URL 的末尾，并创建一个 `splat` 参数
* `**` - 匹配任意字符（贪婪的）直到命中下一个字符 `/`、`?` 或 `#`，并创建一个 `splat` 参数

```js
<Route path="/hello/:name">         // 匹配 /hello/michael 和 /hello/ryan
<Route path="/hello(/:name)">       // 匹配 /hello, /hello/michael 和 /hello/ryan
<Route path="/files/*.*">           // 匹配 /files/hello.jpg 和 /files/path/to/hello.jpg
```

如果一个路由使用了相对`路径`，那么完整的路径将由它的所有祖先节点的`路径`和自身指定的相对`路径`拼接而成。使用绝对`路径`可以使路由匹配行为忽略嵌套关系。

### 优先级

最后，路由算法会根据定义的顺序自顶向下匹配路由。因此，当你拥有两个兄弟路由节点配置时，你必须确认前一个路由不会匹配后一个路由中的`路径`。例如，千万**不要**这么做：

```js
<Route path="/comments" ... />
<Redirect from="/comments" ... />
```

## Route Components

当 route 匹配到 URL 时会渲染一个 route 的组件。路由会在渲染时将以下属性注入组件中：

#### `history`

Router 的 history [history](https://github.com/rackt/history/blob/master/docs)。

对于跳转很有用的 `this.props.history.pushState(state, path, query)`

#### `location`

当前的 [location](https://github.com/rackt/history/blob/master/docs/Location.md)。

#### `params`

URL 的动态段。

#### `route`

渲染组件的 route。

#### `routeParams`

`this.props.params` 是直接在组件中指定 route 的一个子集。例如，如果 route 的路径是 `users/:userId` 而 URL 是 `/users/123/portfolios/345`，那么 `this.props.routeParams` 会是 `{userId: '123'}`，并且 `this.props.params` 会是 `{userId: '123', portfolioId: 345}`。

#### `children`

匹配到子 route 的元素将被渲染。如果 route 有[已命名的组件](https://github.com/rackt/react-router/blob/master/docs/API.md#named-components)，那么此属性会是 undefined，并且可用的组件会被直接替换到 `this.props` 上。
