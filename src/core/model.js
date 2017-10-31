/**
 * @description 模型类
 * @author  yanglei
 * @since   1.0
 */
(function(){
    /**
     * @param	data	数据
     * 			vm		viewmodel
     * 			parent	父model
     * 			prop	绑定属性名
     *
     */
    var M = function(param){
        var me = this;
        var data = param.data;
        me.init = true;     //表示是初始化
        //设置模型的模块
        me.module = param.module;
        if(DD.isObject(data)){
            me.createObjectModel(data);
        }else if(DD.isArray(data)){
            me.createArrayModel(data);
        }
        me.data = data;
        data.$model = me;
        delete me.init;
        //设置模块的模型
        me.module.model = me;
        return me;
    }

    //数据扩展方法
    var extendConfig = {
        $fields:undefined,
        $set:function(key,value){
            var data = this;
            var arr = key.split('.');
            var fn;
            for(var i=0;i<arr.length-1;i++){
                fn = arr[i];
                data = data[fn];
                if(!data){
                    throw DD.Error.handle('notexist1',DD.words.dataItem,fn);
                }
            }
            fn = arr[i];
            //如果不存在，则需要定义 set 和 get 方法
            if(data[fn] === undefined){
                //需要设置默认值
                data.$model.init = true;
                Object.defineProperty(data,key,{
                    set:function(v){
                        data.$model.setProp(data,key,v);
                    },
                    get:function(){
                        return data.$model.getProp(data,key);
                    }
                });
            }
            data[fn] = value;
            delete data.$model.init;
        },
        /**
         * 获取属性值(支持级联查询)
         * @param fn    字段
         * @return      字段值
         */
        $get:function(key){
            var data = this;
            var dOld;
            var fa = key.split(".");
            for(var i=0;i<fa.length && data;i++){
                //是数组
                if(fa[i].lastIndexOf(']') === fa[i].length-1){
                    var f = fa[i].split('[');
                    data = data[f[0]];
                    f.shift();
                    //处理单重或多重数组
                    f.forEach(function(istr){
                        var ind = istr.substr(0,istr.length-1);
                        data = data[parseInt(ind)];
                    });
                }else if(data.$fields){
                    dOld = data.$fields['$old_' + fa[i]];   
                    data = data[fa[i]];
                }
            }
            var changed = false;
            if(dOld !== undefined){
                changed = true;
            }
            return [changed,data];
        },
        /**
         * 数据是否修改
         * @param deep  是否进行子孙节点判断
         * @return      true/false
         */
        $isChanged:function(deep){
            if(!deep){
                return this.changed;
            }else{
                if(this.changed){
                    return true;
                }
                return subChanged(this);
            }

            function subChanged(data){
                if(DD.isObject(data)){  //对象
                    var ps = DD.getOwnProps(data);
                    //判断子对象是否修改
                    for(var i=0;i<ps.length;i++){
                        var o = data[ps[i]];
                        if(DD.isObject(o) || DD.isArray(o)){
                            if(o.changed){
                                return true;
                            }else{
                                return subChanged(o);
                            }
                        }
                    }
                }else if(DD.isArray(data)){   //数组
                    //判断数组元素是否修改
                    for(var i=0;i<data.length;i++){
                        var o = data[i];
                        if(DD.isObject(o) || DD.isArray(o)){
                            if(o.changed){
                                return true;
                            }else{
                                return subChanged(o);
                            }
                        }
                    }
                }
                return false;
            }
        }
    };
    
    /**
     * 属性setter
     * @param prop  属性
     * @param value 设定值
     */
    M.prototype.setProp = function(data,prop,value){
        var me = this;
        data.$model = me;
        if(data.$fields === undefined){
            data.$fields = {};
        }
        var isChange = data.$fields[prop] !== value;
        //如果数据改变，则执行model change事件
        if(isChange){
            if(DD.isObject(value)){
                me.init = true;
                me.createObjectModel(value);
                data.$fields[prop] = value;
            }else if(DD.isArray(value)){
                me.createArrayModel(value);
                data.$fields[prop] = value;
            }else{ //数据项
                //增加旧值字段并保存
                if(me.init){   //model初始化时，旧值设置为null
                    data.$fields['$old_' + prop] = null;
                }else{         //设置之前的值为旧值
                    data.$fields['$old_' + prop] = data.$fields[prop];
                }
                //设置新值
                data.$fields[prop] = value;
            }
            me.change(data);
        }
    }

    /**
     * 属性 getter
     * @param prop  属性名
     */

    M.prototype.getProp = function(data,prop){
        return data.$fields[prop];
    }

    /**
     * change事件
     */
    M.prototype.change = function(data){
        //设置changed标志
        data.$changed = true;
        DD.Renderer.add(this.module);
    }

     /**
     * 清除old value
     */
    M.prototype.clean = function(data){
        var me = this;
        data = data || me.data;
        //清除changed标志
        delete data.$changed;
        if(DD.isObject(data)){
            DD.getOwnProps(data).forEach(function(p){
                if(p[0] === '$' || DD.isFunction(data[p])){
                    return;
                }
                if(DD.isObject(data[p]) || DD.isArray(data[p])){
                    me.clean(data[p]);
                }else{
                    //删除旧值
                    if(data.$fields){
                        delete data.$fields['$old_' + p];    
                    }
                }
            });
        }else if(DD.isArray(data)){
            data.forEach(function(item){
                if(DD.isObject(item)){
                    me.clean(item);    
                }
            });
        }
    }

    /**
     * 设置默认旧值null，路由切换时需要
     */
    M.prototype.setDefault = function(data){
        var me = this;
        data = data || me.data;
        if(DD.isObject(data)){
            DD.getOwnProps(data).forEach(function(p){
                if(p[0] === '$' || DD.isFunction(data[p])){
                    return;
                }
                if(DD.isObject(data[p]) || DD.isArray(data[p])){
                    me.setDefault(data[p]);
                }else{
                    //删除旧值
                    data.$fields['$old_' + p] = null;
                }
            });
        }else if(DD.isArray(data)){
            data.forEach(function(item){
                if(DD.isObject(item)){
                    me.setDefault(item);    
                }
            });
        }
    }

    /**
     * 创建object Model
     * @param obj
     */
    M.prototype.createObjectModel = function(data){
        var me = this;
        DD.assign(data,extendConfig);
        data.$model = me;
        data.$changed = true;
        DD.getOwnProps(data).forEach(function(p){
            //函数不处理;$开头为保留字,不处理
            if(p[0] === '$' || DD.isFunction(data[p])){  
                return;
            }
            var v = data[p];
            Object.defineProperty(data,p,{
                set:function(v){
                    me.setProp(data,p,v);
                },
                get:function(){
                    return me.getProp(data,p);
                }
            });
            data[p] = v;
        });
    }

    /**
     * 创建数组类模型
     * @param arr   数组
     * @param upd   修改
     */
    M.prototype.createArrayModel = function(arr){
        var me = this;
        arr.$model = me;
        arr.$changed = true;
        //初始化新增模型方法
        for(var i=0;i<arr.length;i++){
            var arg = arr[i];
            //递归创建新model
            if(DD.isObject(arg)){
                me.createObjectModel(arg);
            } 
            if(DD.isArray(arg)){
                me.createArrayModel(arg);
            }
        }
        
        //监听数组事件
        var watcher = ['push','unshift','splice','pop','shift','reverse','sort'];
       	//添加自定义事件，绑定改变事件
        watcher.forEach(function(item){
            arr[item] = function(){
                Array.prototype[item].apply(arr,arguments);
                var args=[];
                switch(item){
                    case 'push':
                        args = arguments;
                        break;
                    case 'unshift':
                        args = arguments;
                        break;
                    case 'splice':
                        //插入新元素
                        if(arguments.length>2){
                            for(var i=2;i<arguments.length;i++){
                                args.push(arguments[i]);
                            }
                        }
                        break;
                }

                //初始化参数模型信息
                for(var i=0;i<args.length;i++){
                    var arg = args[i];
                    //递归创建新model
                    if(DD.isObject(arg)){
                        me.createObjectModel(arg);
                    } 
                    if(DD.isArray(arg)){
                        me.createArrayModel(arg);
                    }
                }
                me.change(arr);
            }
        });
    }


    DD.Model = M;
}());