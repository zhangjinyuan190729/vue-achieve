// 关联compile 和observe 模块
class Watcher{
    constructor(vm ,expr ,cb){
        this.vm = vm
        this.expr = expr
        this.cb = cb
        Dep.target = this
        this.oldValue = this.getVMValue(vm,expr)
        Dep.target = null //清空数据
    }
    //更新数据触发
    updata(){
        
        let oldValue = this.oldValue
        let newvalue = this.getVMValue(this.vm,this.expr) 
        if(oldValue !== newvalue){
            this.cb(newvalue,oldValue)
        }
    }
    //解析复杂类型数据
    getVMValue(vm,expr){
        let data = vm.$data
        expr.split('.').forEach(item =>{
            data = data[item]
        })
        return data
    } 
}

// 发布订阅者模式
class Dep{
    constructor(){
      this.subs = []  
    }
    //添加订阅者
    addsubs(watcher){
      this.subs.push(watcher)
    }
    //通知订阅者更新
    notify(){
        //遍历所有的订阅者
        this.subs.forEach(sub=>{
            sub.updata()
        })
    }
}
