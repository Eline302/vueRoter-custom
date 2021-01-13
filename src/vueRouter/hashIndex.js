let _vue = null
export default class VueRouter {
    constructor (options) {
        this.options = options
        this.routeMap = {}
         // 当模式为 hash，初始进入时，进行拼接
        window.location.hash = window.location.hash ? window.location.hash : '#/'
        this.data=_vue.observable({
            // 记录当前的路由地址
            current: window.location.hash
        })
    }
    static install (vue, options) {
        if(VueRouter.install.installed){
            return
        }
        VueRouter.install.installed = true
        _vue = vue
        _vue.mixin({
            beforeCreate(){
                if(this.$options.router){
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
    createRouteMap(){
        this.options.routes.forEach(route => {
            this.routeMap[`#${route.path}`] = route.component
        })
    }
    initComponents(vue){
        let vm = this
        // router-link组件
        vue.component('router-link',{
            props:{
                to: String
            },
            render(h) {
                return h('a',{
                    attrs: {
                        href:`#`,
                        name:this.to
                    },
                    // 注册点击事件
                    on:{
                        click:this.clickHandler
                    }
                },[this.$slots.default])
            },
            methods:{
                clickHandler(e){
                    window.location.hash = `#${this.to}`
                    e.preventDefault()
                }
            }
        })
        // router-view 组件
        vue.component('router-view',{
            render(h){
                const component = vm.routeMap[vm.data.current]
                return h(component)
            }
        })
    }
    // 注册 popstate 事件
    initEvent(){
        window.addEventListener('hashchange',() => {
           this.data.current = window.location.hash
        })
    }
}