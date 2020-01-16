class Compile {
    constructor(el,vm){
    // 判断传过来的是否是个对象 
        this.el = typeof el === 'string'?document.querySelector(el):el
        this.vm = vm
        if(el){
            //1.把文档节点放入内存中。。
            let fragment = this.node2fragment(this.el)
            //2. 在内存中编译模板
            this.compile(fragment)
            //3. 一次性放入视图中
            // 生命周期函数
            this.vm.created(vm)
            this.el.appendChild(fragment)
        }
    }
    // 核心方法-------------------------------------------------------------------
    node2fragment(node){
        // fragment html 代码片段  存在于内存中  不渲染
       let fragment =  document.createDocumentFragment()
       //获取所有子节点
       //这里不需要递归是因为把所有节点一次性获取，子节点当然跟着父节点。
       let childNode = node.childNodes     
       // 遍历所有节点  添加到 fragment 代码片段中
       this.toArray(childNode).forEach(node => {
           fragment.appendChild(node)
       });
       return fragment
    }
    /**
     * 模板编译开始
     * @param {*} fragment 
     */
    compile(fragment){
        let childNode = fragment.childNodes
        this.toArray(childNode).forEach(node=>{
            //是否是元素节点
            // console.dir(node);
            if(this.isElementNode(node)){
                this.compileElement(node)
            }
            //是否是文本节点
            if(this.isTextNode(node)){
                this.compileText(node)
            }
            //是否有子节点
            if(node.childNodes && node.childNodes.length > 0){ 
                //递归解析各个节点下的子节点 
                this.compile(node)
            }
        })
    }
    //解析元素节点
    compileElement(node){
        //获取元素节点的所有属性
        let attributes = node.attributes
        //遍历所有属性
        this.toArray(attributes).forEach(attr =>{
            let attrName = attr.name
            if(this.isDirective(attrName)){
                let expr = attr.value
                let type = attrName.slice(2)
                // 调用指令对象方法
                if(this.isEventDirective(type)){
                    CompileUtils['compileHeader'](node,this.vm,type,expr)
                }
                else{
                    CompileUtils[type]&&CompileUtils[type](node,this.vm,expr)
                }
            }
        })
    }
    //解析文本节点
    compileText(node){
        //获取文本节点内容
        let txt = node.textContent
        //匹配正则表达式 点是任意字符  + 是大于等于两个  ()表示分组 
        let reg = /\{\{(.+)\}\}/   // 正则匹配
        if(reg.test(txt)){
           
         let  expr = RegExp.$1
         node.textContent = txt.replace(reg,CompileUtils.getVMValue(this.vm,expr))
         new Watcher(this.vm,expr,newValue=>node.textContent = txt.replace(reg,newValue))
        }
    }
    // 工具方法------------------------------------------------------------------
    // 转换数组
    toArray(likeArray){
      return [].slice.call(likeArray)//this是 likeArray 把类数组转成真正的数组
    }
    // 模板编译 - 节点判断
    isElementNode(node){
        // nodeType 节点类型： 1：元素节点  3：文本节点
        return node.nodeType === 1          //返回布尔值
    }
    isTextNode(node){
        return node.nodeType === 3         //返回布尔值
    }
    // 判断是否是vue 指令  "v-"
    isDirective(attrName){
        return attrName.startsWith('v-')    //返回布尔值
    }
    //判断是否是事件指令
    isEventDirective(type){
        return type.split(':')[0] === 'on' //返回布尔值
    }
}
//解析指令方法的对象=================================================================
let CompileUtils = {
    //解析v-text指令
    text(node,vm,expr){
        node.textContent = this.getVMValue(vm,expr)
        //观察者模式
        new Watcher(vm,expr,newValue=>node.textContent = newValue)
    },
    //解析 v-html 指令
    html(node,vm,expr){
        node.innerHTML = this.getVMValue(vm,expr)
        //观察者模式
        new Watcher(vm,expr,newValue=>node.innerHTML = newValue)
    },
    //解析 v-model指令
    model(node,vm,expr){
        node.value = this.getVMValue(vm,expr)
         // 双向数据绑定
         let that = this
        node.addEventListener('input',
        function(){
            that.setVMValue(vm,expr,this.value)
        })
         //观察者模式
        new Watcher(vm,expr,newValue=>node.value = newValue)
    },
    // 解析 v-on:click指令
    compileHeader(node,vm,type,expr){
        let even = type.split(':')[1]
        let fn = vm.$methods&&vm.$methods[expr]
        //报错优化  如果没有method 不报错
        if(even&&fn){
            node.addEventListener(even,fn.bind(vm)) //改变方法中的this指向
        }
    },
    //解析复杂类型数据
    getVMValue(vm,expr){
        let data = vm.$data
        expr.split('.').forEach(item =>{
            data = data[item]
        })
        return data
    },
    //设置复杂类型数据 
    setVMValue(vm,expr,value){
        let data= vm.$data
        let arr = expr.split('.')
        arr.forEach((key,index)=>{
            //如果遍历项索引小于 最大的索引 说明data 还不是最终要设置的值 要赋值
            // 索引项不小于最大索引  说明只就是
            // console.log(key,value,);
            if(index < arr.length-1){
                data = data[key]
            }else{
                data[key] = value
            }
        })
    }
}