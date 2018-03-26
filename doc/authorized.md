## Authorized

`children`,`authority`,`noMatch`

权限通过时展示 `children` 内容，否则展示 `noMatch`

`CheckPermissions(authority, children, noMatch);`
`checkPermissions(authority, CURRENT, target, Exception);`

```js
const checkPermissions = (authority, currentAuthority, target, Exception) => {
  // 没有判定权限.默认查看所有
  // Retirement authority, return target;
  if (!authority) {
    return target;
  }
  // 数组处理
  if (Array.isArray(authority)) {
    if (authority.indexOf(currentAuthority) >= 0) {
      return target;
    }
    return Exception;
  }

  // string 处理
  if (typeof authority === 'string') {
    if (authority === currentAuthority) {
      return target;
    }
    return Exception;
  }

  // Promise 处理
  if (isPromise(authority)) {
    return <PromiseRender ok={target} error={Exception} promise={authority} />;
  }

  // Function 处理
  if (typeof authority === 'function') {
    try {
      const bool = authority(currentAuthority);
      if (bool) {
        return target;
      }
      return Exception;
    } catch (error) {
      throw error;
    }
  }
  throw new Error('unsupported parameters');
};
```

## AuthorizedRoute

```js
<Authorized
  authority={authority}
  noMatch={
    <Route
      {...rest}
      render={() => <Redirect to={{ pathname: redirectPath }} />}
    />
  }
>
  <Route
    {...rest}
    render={props => (Component ? <Component {...props} /> : render(props))}
  />
</Authorized>
```
