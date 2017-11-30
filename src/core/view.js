//扩展element方法
DD.extendElementConfig = {
    $module:null,           //模块
    $containModule:null,    //是否模块容器
    $isRouterView:false,    //是否是router view
    $directives:[],         //指令集和
    $savedDoms:{},          //保存的dom集合
    $model:{},              //模型相关参数
    $attrs:{},              //带表达式的属性集合
    $exprs:[],              //表达式数组
    $isView:true,           //view标志
    $events:{},             //事件集合
    $routeConfig:{},        //路由配置
    $forceRender:false,     //强制渲染
    
    /**
     * 是否包含指定指令
     * @param directive     指令名
     * @return true/false
     */
    $hasDirective:function(directive){
        var me = this;
        var ds = me.$directives;
        if(DD.isArray(ds)){
            for(var i=0;i<ds.length;i++){
                if(ds[i].name === directive){
                    return true;
                }
            }    
        }
        return false;
    },
    /**
     * 获取指定指令
     * @param directive     指令名
     * @return 指令或 null
     */
    $getDirective:function(directive){
        var me = this;
        var ds = me.$directives;
        if(DD.isArray(ds)){
            for(var i=0;i<ds.length;i++){
                if(ds[i].name === directive){
                    return ds[i];
                }
            }
        }
        return null;
    },

    /**
     * 移除指定指令
     * @param directive     指令名
     */
    $removeDirective:function(directive){
        var me = this;
        var ds = me.$directives;
        if(DD.isArray(ds)){
            for(var i=0;i<ds.length;i++){
                if(ds[i].name === directive){
                    ds.splice(i);
                    break;
                }
            }
        }
    },
    
    /**
     * 获取数据
     * @return 数据
     */
    $getData:function(){
        var me = this;
        if(!me.$isView){
            return null;
        }
        var data,index,oldIndex;       //数据、索引值、旧索引值
        // 如果view自己有数据，则不再查找
        if(me.$model && me.$model.data){
            data = me.$model.data;
            index = me.$model.index;
            oldIndex = me.$model.oldIndex;
        }else if(me.$module && me.$module.model && me.$module.model.data){
            for(var view=me; view && view.$isView && view !== me.$module.view;view=view.parentNode){
                //找到上一级model即可
                if(view.$model && view.$model.data){
                    index = view.$model.index;
                    data = view.$model.data;
                    oldIndex = view.$model.oldIndex;
                    break;
                }
            }

            if(me.$hasDirective('model')){
                var mn = me.$getDirective('model').value;
                if(data){ //如果父存在数据，则直接从父数据解析
                    if(DD.isObject(data)){
                        if(!DD.isEmpty(mn)){
                            data = data.$get(mn)[1];
                        }
                    }
                }else{
                    data = me.$module.model.data.$get(mn)[1];  
                } 
            }
            if(!data && !me.$hasDirective('model')){
                data = me.$module.model.data;
            }
        }
            
        return {
            data:data,
            index:index,
            oldIndex:oldIndex
        };
    },

    /**
     * 设置强制渲染
     * @param view view
     * @param flag true/false
     */
    $setForceRender:function(flag){
        var view = this;
        view.$forceRender = flag;
        if(view.childNodes){
            //级联设置
            for(var i=0;i<view.childNodes.length;i++){
                var n = view.childNodes[i];
                if(n.$isView){
                    n.$setForceRender(flag);
                }
            }
        }
    }

};