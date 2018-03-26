## 自述

[Redux](https://cn.redux.js.org/docs/introduction/Ecosystem.html)

```js
import { createStore } from 'redux';

/**
 * 这是一个 reducer，形式为 (state, action) => state 的纯函数。
 * 描述了 action 如何把 state 转变成下一个 state。
 *
 * state 的形式取决于你，可以是基本类型、数组、对象、
 * 甚至是 Immutable.js 生成的数据结构。惟一的要点是
 * 当 state 变化时需要返回全新的对象，而不是修改传入的参数。
 *
 * 下面例子使用 `switch` 语句和字符串来做判断，但你可以写帮助类(helper)
 * 根据不同的约定（如方法映射）来判断，只要适用你的项目即可。
 */
function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
}

// 创建 Redux store 来存放应用的状态。
// API 是 { subscribe, dispatch, getState }。
let store = createStore(counter);

// 可以手动订阅更新，也可以事件绑定到视图层。
store.subscribe(() => console.log(store.getState()));

// 改变内部 state 惟一方法是 dispatch 一个 action。
// action 可以被序列化，用日记记录和储存下来，后期还可以以回放的方式执行
store.dispatch({ type: 'INCREMENT' });
// 1
store.dispatch({ type: 'INCREMENT' });
// 2
store.dispatch({ type: 'DECREMENT' });
// 1
```

## 介绍

强制使用 action 来描述所有变化带来的好处是可以清晰地知道应用中到底发生了什么。如果一些东西改变了，就可以知道为什么变。action 就像是描述发生了什么的面包屑。最终，为了把 action 和 state 串起来，开发一些函数，这就是 reducer。再次地，没有任何魔法，reducer 只是一个接收 state 和 action，并返回新的 state 的函数。

```js
function visibilityFilter(state = 'SHOW_ALL', action) {
  if (action.type === 'SET_VISIBILITY_FILTER') {
    return action.filter;
  } else {
    return state;
  }
}

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([{ text: action.text, completed: false }]);
    case 'TOGGLE_TODO':
      return state.map(
        (todo, index) =>
          action.index === index
            ? { text: todo.text, completed: !todo.completed }
            : todo
      );
    default:
      return state;
  }
}
```

再开发一个 reducer 调用这两个 reducer，进而来管理整个应用的 state:

```js
function todoApp(state = {}, action) {
  return {
    todos: todos(state.todos, action),
    visibilityFilter: visibilityFilter(state.visibilityFilter, action)
  };
}
```

这差不多就是 Redux 思想的全部。注意到没我们还美柚使用任何 Redux 的 API。Redux 里有一些工具来简化这种模式，但是主要的想法是如何根据这些 action 对象来更新 state，而且 90%的代码都是纯 JavaScript，没用 Redux，Redux API 和其它魔法。

## 三大原则

### 单一数据源

整个应用的 state 被存储在一棵 object tree 中，并且这个 Object tree 只存在于唯一一个 store 中。

这让同构应用开发变得非常容易。来自服务端的 state 可以再无需编写更多代码的情况下被序列化并注入到客户端中。

### state 是只读的

唯一改变 state 的方法就是触发 action，action 是一个用于描述已发生事件的普通对象。

这样确保了视图和网络请求都不能直接修改 state，相反它们只能表达想要修改的意图。

### 使用纯函数来执行修改

为了描述 action 如何改变 state tree，你需要编写 reducers

Reducer 只是一些纯函数，它接收先前的 state 和 action，并返回新的 state。刚开始你可以只有一个 reducer，随着应用变大，你可以把它拆成多个小的 reducers，分别独立地操作 state
tree 的不同部分，因为 reducer 只是函数，你可以控制它们被调用的顺序，传入附加数据，甚至编写可复用的 reducer 来处理一些通用任务，如分页器。

```js
function visibilityFilter(state = 'SHOW_ALL', action) {
  //  ...
}
function todos(state = [], action) {
  // ...
}
import {combineReducers，createStore} from 'redux'
let reducer = combineReducers({visibilityFilter,todos})
let store = createStore(reducer)
```

Redux 设想你永远不会变动你的数据。你可以很好地使用普通对象和数组来管理 state，而不是在多个 reducer 里变动数据。

## Action

Action 是把数据从应用传到 store 的有效载荷。它是 store 数据的唯一来源。一般来说你会通过 store.dispatch()将 action 传到 store。

Action 本质上是 JavaScript 普通对象。我们约定，action 内必须使用一个字符串类型的 type 字段来表示将要执行的动作。多少情况下，type 会被定义成字符串常量。当应用规模越来越大时，建议使用单独的模块或文件夹来存放 action

```js
import { ADD_TODO, REMOVE_TODO } from '../actionTypes';
```

我们应该尽量减少在 action 中传递的数据。

### Action 创建函数

Action 创建函数就是生成 Action 的方法。action 和 action 创建函数这两个概念很容易混在一起，使用时最好注意区分。

store 里能直接通过 store.dispatch()调用 dispatch()方法，但多数情况下你会使用 react-redux 提供的 connect()帮助器来调用。

```js
export const ADD_TODO = 'ADD_TODO';

export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL'
};

export function addTodo(text) {
  return { type: ADD_TODO, text };
}
```

## Reducer

Reducers 指定了应用状态的变化如何响应 actions 并发送到 store 的，记住 actions 只是描述了有事情发生了这一事实，并没有描述应用如何更新 state

### 设计 state 结构

在 Redux 应用中，所有的 state 都被保存在一个单一对象中。建议在写代码前先想一下这个对象的结构。如何才能以最简单的形式把应用的 state 用法描述出来。

处理 reducer 关系时的注意事项

开发复杂的应用时，不可避免会有一些数据相互引用。建议你尽可能地把 state 范式化，不存在嵌套。

把所有数据放到一个对象里，每个数据以 ID 为主键，不同实体或列表间通过 ID 相互引用数据。把应用的 state 想象成数据库。

### Action 处理

现在我们已经确定了 state 对象的结构，就可以开始开发 reducer。reducer 就是一个纯函数，接收旧的 state 和 action，返回新的 state

```js
(previousState, action) => newState;
```

之所以将这样的函数称之为 reducer，是因为这种函数与被传入 Array.prototype.reduce(reducer,?initialValue)里的回调函数属于相同的类型。保持 reducer 纯净非常重要。永远不要在 reducer 里做这些操作：

* 修改传入参数
* 执行有副作用的操作，如 API 请求和路由跳转
* 调用非纯函数，如 Date.now()或 Math.random()

combineReducers()所做的只是生成一个函数，这个函数来调用你的一系列 reducer，每个 reducer 根据它们的 key 来筛选出 state 中的一部分数据并处理，然后这个生成的函数再将所有 reducer 的结果合并成一个大的对象。

## store

在前面我们学会了使用 action 来描述发生了什么和使用 reducers 来根据 action 更新 state 的用法。

store 就是把它们联系到一起的对象。Store 有以下职责：

* 维持应用的 state
* 提供 getState()方法获取 state
* 提供 dispatch(action)方法更新 state
* 通过 subscribe(listener)注册监听器
* 通过 subscribe(listener)返回的函数注销监听器

再次强调一下 Redux 应用只有一个单一的 store。当需要拆分数据处理逻辑时，你应该使用 reducer 组合而不是创建多个 store

## 数据流

严格的单向数据流是 Redux 架构的设计核心。

Redux 应用中数据的生命周期遵循下面 4 个步骤：

* 调用 store.dispatch(action)

  你可以在任何地方调用 store.dispatch(action)，包括组件中，XHR 回调中，甚至定时器中。

* Redux store 调用传入的 reducer 函数

  Store 会把两个参数传入 reducer：当前的 state 树和 action。

* 根 reducer 应该把多个子 reducer 输出合并成一个单一的 state 树。

  根 reducer 的结构完全由你决定。Redux 原生提供 combineReducers()辅助函数，来把根 reducer 拆分成多个函数，用于分别处理 state 树的一个分支。

## 配合 React

做个 TodoList

展示组件：描述如何展现。(骨架，样式)
容器组件：描述如何运行 (数据获取，状态更新)

### 展示组件

* TodoList 用于显示 todos 列表。
  * todos: Array
  * onTodoClick
* Todo 一个 todo 项
  * text：string
  * completed: boolean
  * onClick() 当 todo 项被点击时调用的回调函数
* Link 带有 callback 回调功能的链接
  * onClick() 当点击链接时会触发
* Footer 一个允许用户改变可见 todo 过滤器的组件
* App 根组件，渲染余下的所有内容

这些组件只定义外观并不关心数据来源和如何改变。传入什么就渲染什么。如果你把代码从 Redux 迁移到别的架构，这些组件可以不做任何改动直接使用。

### 容器组件

还需要一些容器组件来把展示组件链接到 Redux。例如，展示型的 TodoList 组件需要一个类似 visibleTodoList 的容器来监听 Redux store 变化并处理如何过滤出要显示的数据。

为了实现状态过滤，需要实现 FilterLink 的容器组件来渲染 Link 并在点击时触发对应的 action

* visibleTodoList 根据当前显示的状态来对 todo 列表进行过滤，并渲染 TodoList
* filterLink 得到当前过滤器并渲染 Link。
  * filter：string 就是当前过滤的状态

### 其他组件

有时很难分清到底该使用容器组件还是展示组件。列如，有时表单和函数严重耦合在一起，如这个小的组件

* AddTodo 含有 Add 按钮的输入框

技术上讲可以把它分成两个组件，但一开始就这么做有点早。在一些非常小的组件里混用容器和展示是可以的。当业务变得复杂后，如何拆分就很明显了。

`Component/Todo.js`

```js
import React from 'react';
import PropTypes from 'prop-types';

const Todo = ({ onClick, completed, text }) => {
  <li
    onClick={onClick}
    style={{ textDecoration: completed ? 'line-through' : 'none' }}
  >
    {text}
  </li>;
};

Todo.propTypes = {
  onClick: PropTypes.func.isRequired,
  completed: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
};
export default Todo;
```

`Component/TodoList.js`

```js
import React from 'react';
import propTypes from 'prop-types';
import Todo from './Todo';

const TodoList = ({ todos, onTodoClick }) => {
  <ul>
    {todos.map((todo, index) => (
      <Todo key={index} {...todo} onClick={() => onTodoClick(index)} />
    ))}
  </ul>;
};

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      completed: PropTypes.bool.isRequired,
      text: PropTypes.string.isRequired
    }).isRequired
  ).isRequired,
  onTodoClick: PropTypes.func.isRequired
};

export default TodoList;
```

`Component/Link.js`

```js
import React from 'react';
import propTypes from 'prop-types';

const Link = ({ active, children, onClick }) => {
  if (active) {
    return <span>{children}</span>;
  }
  return (
    <a
      href=""
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </a>
  );
};

Link.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
};

export default Link;
```

`Component/Footer.js`

```js
import React from 'react';
import FilterLink from '../containers/FilterLink';

const Footer = () => (
  <p>
    Show: <FilterLink filter="SHOW_ALL">ALL</FilterLink>
    {', '}
    <FilterLink filter="SHOW_ACTIVE">Active</FilterLink>
    {', '}
    <FilterLink filter="SHOW_COMPLETED">Completed</FilterLink>
  </p>
);

export default Footer;
```

### 实现容器组件

现在来创建一些容器组件把这些展示组件和 Redux 关联起来。技术上讲，容器组件就是使用 store.subscribe()

从 Redux state 树中读取部分数据，并通过 props 来把这些数据提供给要渲染的组件。

你可以手工来开发容器组件，但建议使用 React Redux 库的 connect() 方法来生成，这个方法做了性能优化来避免很多不必要的重复渲染。

使用 connect()前，需要先定义 mapStateToProps 这个函数来指定如何把当前 Redux store state 映射到展示组件的 props 中。

例如，visibleTodoList 需要计算传到 TodoList 中的 todos，所以定义了根据 state.visibilityFilter 来过滤 state.todos 的方法，并在 mapStateToProps 中使用。

```js
const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed);
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed);
    case 'SHOW_ALL':
    default:
      return todos;
  }
};

const mapStateToProps = state => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  };
};
```

除了读取 state，容器组件还能分发 Action。类似的方式，可以定义 mapDispatchToProps()方法接收 dispatch()方法并返回期望注入到展示组件的 props 中的回调方法。

例如，我们希望 VisibleTodoList 向 TodoList 组件注入一个叫 onTodoClick 的 props 中，还希望 onTodoClick 能分发 TOGGLE_TODO 这个 action

```js
const mapDispatchToProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id));
    }
  };
};
```

最后，使用 connnect() 创建 visibleTodoList，并传入这两个函数。

```js
import { connect } from 'react-redux';

const visibleTodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList);

export default visibleTodoList;
```

这就是 React Redux API 的基础，但还漏了一些快捷技巧和强大的配置。

`containers/FilterLink.js`

```js
import { connect } from 'react-redux';
import { setVisibilityFilter } from '../actions';

import Link from '../components/Link';

const mapStateToProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch(setVisibilityFilter(ownProps.filter));
    }
  };
};

const FilterLink = connect(mapStateToProps, mapDispatchToProps)(Link);

export default FilterLink;
```

`containers/VisibleTodoList.js`

```js
import { connect } from 'react-redux';
import { toggleTodo } from 'actions';
import TodoList from '../components/TodoList';

const getVisibleTodos = (todos, filter) => {
  switch (fiter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed);
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed);
  }
};

const mapStateToProps = state => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id));
    }
  };
};

const VisibleTodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList);
```

`containers/AddTodo.js`

```js
import React from 'react';
import { connect } from 'react-redux';
import { addTodo } from '../actions';

let AddTodo = ({ dispatch }) => {
  let input;
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!input.value.trim()) {
            return;
          }
          dispatch(addTodo(input.value));
          input.value = '';
        }}
      >
        <input
          ref={node => {
            input = node;
          }}
        />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
};

AddTodo = connect()(AddTodo);
export default AddTodo;
```

`components/App.js`

```js
import React from 'react';
import Footer from './footer';
import AddTodo from '../containers/AddTodo';
import VisibleTodoList from '../containers/VisibleTodoList';

const App = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
);

export default App;
```

所有容器组件都可以访问 Redux store，所以可以手动监听它。一种方式是把它以 props 的形式传入到所有容器组件中。

建议的方式是使用指定的 React Redux 组件 <Provider> 来让所有容器组件都可以访问 store，而不必显示地传递它。只需要在渲染根组件时使用即可。

`index.js`

```js
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStroe } from 'redux';
import todoApp from './reducers';
import App from './components/App';

let store = createStore(todoApp);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

## 异步 Action

当调用异步 API 时，有两个非常关键的时刻，发起请求的时刻，和接收到响应的时刻。

这两个时刻都可能会更改应用的 state。为此，你需要 dispatch 普通的同步 action。一般情况下，每个 API 请求都需要 dispatch 至少三种 action

* 一种通知 reducer 请求开始的 action
* 一种通知 reducer 请求成功的 action
* 一种通知 reducer 请求失败的 action
