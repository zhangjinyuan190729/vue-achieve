/*数据劫持操作
方便数据操作  getter   setter
*/
class Observe {
    constructor(data){
        this.data = data
        // console.log(this.data);
        this.walk(data)
    }
    walk(data){
        if(!data || typeof data != 'object'){
            return
        }
        Object.keys(data).forEach(key =>{
            this.definereactive(data,key,data[key])
            this.walk(data[key])
        })
    }
    definereactive(obj,key,value){
        let that = this
        let dep = new Dep()
        Object.defineProperty(obj,key,{
            enumerable:true, //是否允许遍历
            configurable:true,  //是否可以配置
            get(){
                Dep.target&&dep.addsubs(Dep.target)
                return value
            },
            set(newValue){
                if(value == newValue){
                    return
                }
                value = newValue
                //如果新值是一个对象  也能重新劫持
                that.walk(newValue)
                dep.notify()
            }
        })
    }
}