import fetch from 'dva/fetch';
import React from 'react';

export const dva = {
  config: {
    onError(err) {
      err.preventDefault();
    },
  },
};

let authRoutes = null;

function renderRoute(route) {
  if (route.component) route.component = require(`${route.component}`).default; // eslint-disable-line
  return route;
}
function renderRoutes(routes) {
  routes.forEach(element => {
    element = renderRoute(element); // eslint-disable-line
    if (element && element.routes) {
      element.routes = renderRoutes(element.routes); // eslint-disable-line
    } else {
      element.exact = element.exact || true; // eslint-disable-line
    }
    if (element.Routes) {
      element.Routes = renderRoute(element.Routes); // eslint-disable-line
    }
  });

  // 开发模式添加404页面
  const noFindPage = require('./pages/404.js').default; // eslint-disable-line
  routes.push({
    component: () =>
      React.createElement(noFindPage, {
        pagesPath: 'src/pages',
        hasRoutesInConfig: true,
      }),
  });
  return routes;
}

export function patchRoutes(routes) {
  // 这里获取不到 process.env.APP_ROUTES
  // console.log(process.env.APP_ROUTES === 'runtime');
  // 这里应该做判断的
  // if (process.env.APP_ROUTES === 'runtime') {
  const routesRender = renderRoutes(authRoutes);
  routes.length = 0; // eslint-disable-line
  Object.assign(routes, routesRender);
  // }
}

export function render(oldRender) {
  fetch('/api/auth_routes')
    .then(res => res.json())
    .then(ret => {
      authRoutes = ret;
      oldRender();
    });
}
