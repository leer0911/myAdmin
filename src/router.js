import React from 'react';
import { routerRedux, Route, Switch } from 'dva/router';
import { getRouterData } from './common/router';
const { ConnectedRouter } = routerRedux;

function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);
  const UserLayout = routerData['/user'].component;
  return (
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/user" component={UserLayout} />
      </Switch>
    </ConnectedRouter>
  );
}

export default RouterConfig;
