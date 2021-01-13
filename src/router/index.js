import Vue from 'vue';
import vueRouter from '../vueRouter/hashIndex.js';

import Home from '@views/home';

Vue.use(vueRouter);

const routes=[{
    path: '/',
    name: 'Home',
    component: Home,
   },
   {
    path: '/About',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: ()=>import(/* webpackChunkName:'About' */ '@views/about'),
}]

const router =new vueRouter({
    mode:'hash',
    // 设置路由基地址
    base:process.env.BASE_URL,
    routes
})

export default router

