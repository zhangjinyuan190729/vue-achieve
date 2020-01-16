// import {Compile} from './compile.js'
class Vue {
    //判断实参是否有值  es6设置默认值
    constructor(options={}){
        this.$el = options.el
        this.$data = options.data
        this.$methods = options.methods
        this.created = options.created
        //实例代理数据
        this.proxy(this.$data)
        //实例代理方法
        this.proxy(this.$methods)
        //开启数据劫持
        if(this.$data){
            new Observe(this.$data)
        }
        //判断是否绑定模板
        if(this.$el){
            //专门处理模板的 类  Compile【编译】
            //需要数据  模板 数据
            new Compile(this.$el,this)
        }
    }
    proxy(data){
        Object.keys(data).forEach(key=>{
            //用数据劫持  变向给this 挂载数据 key 是data里的每一项
            Object.defineProperty(this,key,{
                configurable:true,//可以重新配置
                enumerable:true, //可以遍历
                set(newvalue){
                    if(data[key]==newvalue){
                        return
                    }
                    data[key] = newvalue
                },
                get(){
                    //返回$data 里的值   变向数据直接挂载this
                    return data[key]
                }
            })

        })
    }
}