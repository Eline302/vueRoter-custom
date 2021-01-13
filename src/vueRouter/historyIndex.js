let _vue = null
export default class VueRouter {
    /**
     * 构造函数，返回vueRouter对象
     * @param {Object} options [记录构造函数中传入的对象(路由规则)]
     * @param {Object} routeMap [是一个对象，用来记录路由地址和组件的对应关系，将来会把路由规则解析到routeMap中]
     * @param {Object} data [存储当前的路由地址，当路由变化时，需要加载对应的组件，因此，需要设置成一个响应式的对象]
     */
    constructor (options) {
        // 记录构造函数中传入的选项（new vueRouter(routes:[{}])）
        this.options = options
        // 当options中传入的 routes(路由规则) 解析出来以后，会将其存储到routeMap(键：路由地址 值：地址所对应的路由组件)对象中，以便在router-view组件中，可以根据路由地址在routeMap中找到对应的组件，并将其渲染到浏览器中
        this.routeMap = {}
        // 响应式对象，使用 Vue.observable() 创建 当路由地址发生改变后对应的组件要自动更新
        this.data=_vue.observable({
            // 记录当前的路由地址，默认 '/'
            current: '/'
        })
    }
    /**
     * install方法：实现vue插件机制
     * @param {[Object]} vue  [Vue构造器]
     * @param {[Object]} options [可选的选项对象]
     */
    static install (vue, options) {
        // 1.判断当前插件是否已经被安装
        if(VueRouter.install.installed){
            return
        }
        // 插件已经被安装
        VueRouter.install.installed = true
        // 2.把vue构造函数记录到全局变量，因为在VueRouter实例方法中要使用vue构造函数，比如创建router-link和router-view组件时候使用vue.component
        _vue = vue
        // 3.把创建vue实例时候传入的router对象注入到vue实例上
        // 在插件中给所有的vue实例混入一个选项
        _vue.mixin({
            // 所有的组件都会执行混入的beforeCreate，需要判断只需要在vue实例中执行一次，组件中不需要执行
            beforeCreate(){
                // 只有vue的$option选项中才有router这个属性，组件的选项中是没有的（this指向当前是vue实例）
                if(this.$options.router){
                    // console.log(this.$options.router); //VueRouter  this:vue
                    _vue.prototype.$router = this.$options.router
                    this.$options.router.init()
                }
            }
        })
    }
    init(){
        this.createRouteMap()
        this.initComponents(_vue)
        this.initEvent()
    }
    // 会把构造函数中选项的 routes(路由规则)，转换成键值对的形式，存储到 routeMap对象中
    createRouteMap(){
        // 遍历所有的路由规则，把路由规则解析成键值对的形式，存储到routeMap(键：路由地址 值：地址所对应的路由组件)中
        this.options.routes.forEach(route => {
            this.routeMap[route.path] = route.component
        })
    }
    // 创建 router-link 和 router-view 组件
    initComponents(vue){
        // router-link组件，最终以a标签形式渲染到浏览器中
        vue.component('router-link',{
            props:{
                to: String
            },
            // template:'<a :href="to"><slot></slot></a>'  // 完整版vue可以使用，vue-cli创建默认是运行时，如果使用可以配置vue.config.js https://cli.vuejs.org/zh/config/#runtimecompiler
            /**
             * 渲染函数
             * @param {function} h [创建虚拟DOM，可以将标签和组件转换为虚拟DOM 参数：（选择器(标签名)，创建DOM属性(标签属性)，标签内容（生成元素中的子元素数组形式））]
             */
            render(h) {
                // render函数中调用h函数并将结果返回
                // this.$slots.default 获取默认插槽
                return h('a',{
                    attrs: {
                        href:this.to
                    },
                    // 注册点击事件
                    on:{
                        click:this.clickHandler
                    }
                },[this.$slots.default])
            },
            methods:{
                clickHandler(e){
                  // console.log(this); //VueComponent 
                  // 改变浏览器的地址栏，但不向服务器发送请求，只在客户端进行操作
                  /**
                   * pushState() 仅仅只改变浏览器地址栏中的地址，不会像服务器发送请求
                   * @param data  触发popstate事件，传给 popstate 的事件对象
                   * @param title 网页的标题
                   * @param url?  地址
                   */
                    history.pushState({}, '', this.to)
                    // 将当前的路径记录到 data.current 中
                    // data响应式对象，当值改变时，自动加载对应的组件，进行渲染视图
                    // console.log(this.$router); //VueRouter 
                    this.$router.data.current = this.to  
                    // 阻止默认事件（点击超链接不向服务器发送请求）
                    e.preventDefault()
                }
            }
        })
        // router-view 组件
        // console.log(this); //VueRouter 
        let vm = this
        vue.component('router-view',{
            render(h){
                // console.log(this); //proxy
                // 通过当前路由地址，在routeMap中找到对应组件
                const component = vm.routeMap[vm.data.current]
                // h 函数，直接把一个组件转换成虚拟DOM并返回
                return h(component)
            }
        })
    }
    // 注册 popstate 事件，当历史发生变化时，进行触发。即点击浏览器的前进后退按钮时，触发 popstate 事件。
    initEvent(){
        window.addEventListener('popstate',() => {
           this.data.current = window.location.pathname
        })
    }
}