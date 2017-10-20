'use strict';
/**
 * @description 指令集
 * 指令优先级    数字越小优先级越高
 * @author      yanglei
 * @since       1.0.0
 */
(function(){
    DD.Directive = {
    // var M = function(){
        // var me = this;
        directives : {
            model:{
                preOrder:1,
                once:false,
                sys:true,
                init:initmodel,
                handler:domodel
            },
            repeat:{
                preOrder:2,
                once:false,
                sys:true,
                init:initrepeat,
                handler:dorepeat
            },
            class:{
                preOrder:3,
                once:false,
                sys:true,
                init:initclass,
                handler:doclass
            },
            if:{
                preOrder:5,
                once:false,
                sys:true,
                init:initif,
                handler:doif
            },
            else:{
                preOrder:5,
                once:false,
                sys:true,
                init:initelse
            },
            show:{
                preOrder:5,
                sys:true,
                init:initshow,
                handler:doshow
            },
            field:{
                preOrder:5,
                init:initfield,
                handler:dofield        
            }
        },
    

        /**
         * 添加自定义指令
         * @param 参数 
         *      name        指令名
         *      init        初始化方法
         *      handler     调用方法
         *      preorder    优先级，自定义优先级不得低于20，优先级请谨慎设置，否则会导致解析不一致
         */
        create : function(config){
            var me = this;
            
            if(!DD.isObject(config) || DD.isEmpty(config)){
                throw DD.Error.handle("invoke","createDirective",1,'object');
            }
            if(DD.isEmpty(config.name)){
                throw DD.Error.handle("invoke","createDirective","name",'string');   
            }
            if(DD.Directive.directives[config.name]){
                throw DD.Error.handle("exist1",DD.words.directive,config.name);      
            }

            if(config.init && !DD.isFunction(config.init)){
                throw DD.Error.handle("invoke","createDirective","init",'function');      
            }

            if(config.handler && !DD.isFunction(config.handler)){
                throw DD.Error.handle("invoke","createDirective","handler",'function');      
            }

            if(config.preOrder === undefined || config.preOrder < 10){
                config.preOrder = 10;
            }
            config.once = config.once || false;
            me.directives[config.name] = config;
        },

        /**
         * 移除指令
         * @param directiveName 指令名
         */
        remove : function(directiveName){
            var me = this;
            var dv = DD.Directive.directives[name];
            if(dv && dv.sys){
                throw DD.Error.handle("notremove1",DD.words.directive,name);
            }
            delete me.directives[directiveName];
        },

        /**
         * 获取指令
         */
        get : function(directiveName){
            return this.directives[directiveName];
        },

        /**
         * 指令排序
         * @param view  视图
         */
        sortDirectives : function(view){
            var me = this;
            var dirs = view.$directives;
            if(dirs.length > 1){
                dirs.sort(function(a,b){
                    var da = a.name;
                    var db = b.name;
                    var dira = me.directives[da];
                    var dirb = me.directives[db];
                    return dira.preOrder -  dirb.preOrder;
                });
            }
        },
        /**
         * 初始化视图指令集
         * @param view
         */
        initViewDirectives : function(view){
            var me = this;
            var attrs = DD.getAttrs(view,/^x-/);
            
            //移除指令属性
            attrs.forEach(function(attr){
                view.removeAttribute(attr.name);
            });
            //移除element中的指令
            attrs.forEach(function(attr){
                var aname = attr.name.substr(2);
                var value = attr.value;
                //把指令添加到directives数组
                view.$directives.push({name:aname,value:value});
                if(me.directives[aname] !== undefined && DD.isFunction(me.directives[aname].init)){
                    me.directives[aname].init.call(view,value);
                }
            });
            me.sortDirectives(view);
        },

        /**
         * 初始化指定的view 指令
         * @param view          指令对应的view
         * @param directives    指令集
         */
        initViewDirective : function(view,directives){
            var me = this;
            directives.forEach(function(d){
                //如果不包含此指令，则增加，否则重新初始化
                if(!view.$hasDirective(d.name)){
                    view.$directives.push(d);
                }
                var value = d.value;
                //把指令添加到directives数组
                if(me.directives[d.name] !== undefined && DD.isFunction(me.directives[d.name].init)){
                    me.directives[d.name].init.call(view,d.value);
                }
            });
            me.sortDirectives(view);
        },

        /**
         * 指令处理
         * @param view  视图
         */
        handle : function(view){
            var me = this;
            var el = view;
            var removeArr = [];
            view.$directives.forEach(function(item){
                var dname = item.name;
                var d = me.directives[dname];
                if(d !== undefined && DD.isFunction(d.handler)){
                    d.handler.call(view,item);
                    //只执行一遍，则需要移除，记录删除指令位置
                    if(d.once === true){
                        removeArr.push(view.$directives.indexOf(item));
                    }
                }
            });
            //移除只执行一次的命令
            if(removeArr.length > 0){
                for(var i=removeArr.length-1;i>=0;i--){
                    view.$directives.splice(removeArr[i],1);
                }
            }
        }
    }

    /**
     * 初始化model 指令
     * @param value 属性值
     */
    function initmodel(value){
        var view = this;
        var alias;
        
        if(!value){
            throw DD.Error.handle("paramException","x-model");
        }
        value = value.trim();
        if(DD.isEmpty(value)){
            throw DD.Error.handle("paramException","x-model");
        }
        
        var d = view.$getDirective('model');
        d.value = value;
    }
    /**
     * 初始化repeat 指令
     * @param value 属性值
     */
    function initrepeat(value){
        var view = this;
        var alias;      //别名
        var modelStr;   //模型串
        var modelName;  //模型名
        
        if(!value){
            throw DD.Error.handle("paramException","x-repeat");
        }
        value = value.trim();
        if(DD.isEmpty(value)){
            throw DD.Error.handle("paramException","x-repeat");   
        }

        var ind,filter;
        if((ind=value.indexOf('|')) !== -1){
            modelName = value.substr(0,ind).trim();
            filter = value.substr(ind+1).trim();
        }else{
            modelName = value;
        }
        
        //替换repeat指令
        var d = view.$getDirective('repeat');
        d.value = modelName;
        d.filter = filter;
        d.done = false;
        
        //用占位符保留el占据的位置
        var tnode = document.createTextNode("");
        DD.replaceNode(view,tnode);
        //存储el
        tnode.$savedDoms['repeat'] = view;
        //增加x-model指令
        DD.Directive.initViewDirective(tnode,[{name:'model',value:modelName}]);

        //删除保存节点的repeat指令
        view.$removeDirective('repeat');
    }

    /**
     * 初始化if 指令
     * @param value 属性值
     */
    function initif(value){
        var view = this;
        //else节点
        var node = view.nextElementSibling||view.nextSibling;
        var d = view.$getDirective('if');
        //处理表达式
        d.value = DD.Expression.initExpr("{{" + d.value + "}}");
        //savedDom数组
        var arr = [view];

        if(DD.isEl(node) && node.hasAttribute('x-else')){
            d.hasElse = true;
            arr.push(node);
        }else{
            d.hasElse = false;
        }

        //创建占位符
        var tnode = document.createTextNode("");
        DD.replaceNode(view,tnode);
        //移除if指令
        view.$removeDirective('if');
        // 保存saveDoms
        tnode.$savedDoms['if'] = arr;
    }

    /**
     * 初始化else
     * @param value 属性值
     */
    function initelse(value){
        // 移除else指令
        this.$removeDirective('else');
        DD.remove(this);
    }

    /**
     * 初始化show
     * @param value 属性值
     */
    function initshow(value){
        var view = this;
        //view.$savedDoms['show'] = view;
        var d = view.$getDirective('show');
        //处理表达式
        d.value = DD.Expression.initExpr("{{" + d.value + "}}");
    }

     /**
     * 初始化class 指令
     * @param directive 指令
     */
    function initclass(value){
        var view = this;
        var d = view.$getDirective('class');
        //转换为json数据
        var obj = eval('(' + value + ')');
        if(!DD.isObject(obj)){
            return;
        }
        var robj = {};
        DD.getOwnProps(obj).forEach(function(key){
            if(DD.isString(obj[key])){
                //表达式处理
                robj[key] = DD.Expression.initExpr('{{' + obj[key]+ '}}',view.$module);
            }else{
                robj[key] = obj[key];
            }
        });
        d.value = robj;
    }

    /**
     * 初始化field指令
     */
    function initfield(){
        var view = this;
        var dv = view.$getDirective('field').value;
        // 带过滤器情况
        var ind,field;
        if((ind=dv.indexOf('|')) !== -1){
            field = dv.substr(0,ind);
        }else{
            field = dv;
        }
        var tgname = view.tagName.toLowerCase();
        var eventName = 'input';
        if(tgname === 'input' && (view.type === 'checkbox' || view.type === 'radio')){
            eventName = 'change';
        }

        //把字段名追加到value属性,radio有value，不能设置
        if(view.type !== 'radio'){
            view.$attrs['value']=DD.Expression.initExpr("{{" + dv+ "}}",view);
        }
        new DD.Event({
            view:view,
            eventName:eventName,
            handler:function(e,model,el){
                //根据选中状态设置checkbox的value
                if(el.type === 'checkbox'){
                    if(DD.attr(el,'yes-value') === el.value){
                        el.value = DD.attr(el,'no-value');
                    }else{
                        el.value = DD.attr(el,'yes-value');
                    }
                }
                model[field] = el.value;
            }
        });
    }

    /**
     * 执行model指令
     * @param directive 指令
     */
    function domodel(directive){
        var view = this;
        //清掉之前的数据
        view.$model = null;
        view.$model = view.$getData();
    }

    /**
     * repeat 指令
     * @param directive 指令
     */
    function dorepeat(directive){
        var view = this;
        
        if(DD.isEmpty(directive)){
            directive = view.$getDirective('repeat');
        }
        var model = view.$model;
        //如果没有数据，则不进行渲染
        if(model.data === undefined || !DD.isArray(model.data) || model.data.length === 0){
            return;
        }
        var subModels = [];
        if(directive.filter){
            //有过滤器，处理数据集合
            subModels = DD.Filter.handle(view.$module,model.data,directive.filter);
        }else{
            subModels = model.data;
        }

        //存储渲染过的element
        var renderedDoms = [];
        var bnode = view.nextElementSibling||view.nextSibling;
        
        while(bnode && bnode.$fromNode === view){
            renderedDoms.push(bnode);
            bnode = bnode.nextElementSibling||bnode.nextSibling;
        }

        var fnode = view;
        var needSort = false;
        var newDoms = [];
        var fnode;
        subModels.forEach(function(m,i){
            var nod;
            if(i<renderedDoms.length){
                nod = renderedDoms[i];
            }else{  //增加新的dom
                nod = DD.cloneNode(view.$savedDoms['repeat']);
                //保留fromnode，用于删除
                nod.$fromNode = view;
                DD.insertAfter(nod,fnode);
            }
            nod.$model.data = m;
            nod.$forceRender = view.$forceRender;
            //设置强制渲染，1继承 2 产生了新元素
            if(view.$forceRender || i>=renderedDoms.length){
                nod.$setForceRender(true);
            }
            //保存index
            if(nod.$model.index !== i){
                nod.$model.oldIndex = nod.$model.index;
                m.$changed = true;

            }
            nod.$model.index = i;
            //设置最后节点
            fnode = nod;
        });
        //从已渲染列表移除多余的节点
        for(var i=renderedDoms.length-1;i>=subModels.length;i--){
            DD.remove(renderedDoms[i]);
        }
    }

    /**
     * if指令执行
     * @param directive   指令，可为空
     */
    function doif(directive){
        var view = this;
        if(DD.isEmpty(directive)){
            directive = view.$getDirective('if');
        }
        var model = view.$getData();
        if(DD.isArray(directive.value)){
            var re = DD.Expression.handle(view.$module,directive.value,model);
            //无修改，不执行
            if(!re[0] && !view.$forceRender){
                return;
            }
            var r = re[1];
        }else{
            r = directive.value;
        }
        if(!r || r === "false"){
            r = false;
        }else{
            r = true;
        }
        // 判断显示哪个节点
        var node;
        if(r){
            //如果当前if指令值为true，则直接返回
            if(directive.yes === true){
                return;
            }
            node = view.$savedDoms['if'][0];
        }else if(directive.hasElse){
            //如果当前if的值为false，则直接返回
            if(directive.yes === false){
                return;
            }
            node = view.$savedDoms['if'][1];
        }
        //保存if指令值
        directive.yes = r;
        
        //if节点渲染在view后，view是一个空的textnode
        if(view.nextSibling && view.nextSibling.$fromNode === view){
            DD.remove(view.nextSibling);
        }
        
        if(node !== undefined){
            //clonenode if或else节点
            var n = DD.cloneNode(node);
            DD.insertAfter(n,view);
            n.$fromNode = view;
            n.$setForceRender(true);
        }
    }

    /**
     * 执行class 指令
     * @param directive 指令
     */
    function doclass(directive){
        var view = this;
        //只针对element处理
        if(view.nodeType !== Node.ELEMENT_NODE){
            return;
        }
        if(DD.isEmpty(directive)){
            directive = view.$getDirective('class');
        }
        var model = view.$getData();
        var obj = directive.value;

        DD.getOwnProps(obj).forEach(function(key){
            var r = obj[key];
            if(DD.isArray(obj[key])){
                var re = DD.Expression.handle(view.$module,obj[key],model);
                if(!re[0] && !view.$forceRender){
                    return;
                }
                r = re[1];
            }
            if(!r || r === "false"){
                r = false;
            }else{
                r = true;
            }

            if(r){
                DD.addClass(view,key);
            }else{
                DD.removeClass(view,key);
            }
        });
    }

    /**
     * 执行show指令
     * @param directive 指令 
     */
    function doshow(directive){
        var view = this;
        if(DD.isEmpty(directive)){
            directive = view.$getDirective('show');
        }
        var res = render();

        if(!directive.display){ //执行第一次
            setTimeout(function(){
                //延迟获取display样式，因为未显示的时候display为空字符串
                if(directive.display === undefined){
                    var dip = DD.css(view,'display');
                    //为空或none则设置默认值
                    if(dip==='' || dip === 'none'){
                        dip = 'inline';
                    }
                    directive.display = dip;
                }
                //display属性延迟获取
                if(res){
                    show();  
                }
            },0);
        }else{
            if(res){
                show();
            }
        }
        
        function show(){
            if(directive.yes){
                DD.css(view,'display',directive.display); 
                //设置强制渲染
                // view.$setForceRender(true);
            }else{
                DD.css(view,'display','none');    
            }
        }
        
        function render(){
            var model = view.$getData();
            //执行表达式对象
            var r = true;
            if(DD.isArray(directive.value)){
                var re = DD.Expression.handle(view.$module,directive.value,model);
                if(!re[0] && !view.$forceRender){
                    return false;
                }
                r = re[1];    
            }else{
                r = directive.value;
            }
            if(!r || r === "false"){
                r = false;
            }else{
                r = true;
            }
            if(r){
                if(directive.yes === true){
                    return false;
                }
            }else{
                if(directive.yes === false){
                    return false;
                }
                
            }
            directive.yes = r;  
            return true;  
        }
    }

    /**
     * 执行field指令
     * @param directive 指令 
     */
    function dofield(directive){
        var view = this;
        var tp = view.type;
        var tgname = view.tagName.toLowerCase();
        if(tp !== 'radio' && tp !== 'checkbox' && tgname !== 'select'){
            return;
        }
            
        var model = view.$getData();
        var re = model.data.$get(directive.value);
        //对应字段无修改，则不执行
        if(!re[0] && !view.$forceRender){
            return;
        }
        var v = re[1];
        if(tp === 'radio'){
            var value = view.value;
            if(v == value){
                DD.attr(view,'checked','checked');
            }else{
                view.removeAttribute('checked');
            }
        }else if(tp === 'checkbox'){
            //设置状态和value
            var yv = DD.attr(view,'yes-value'); 
            
            if(v+'' == yv){
                DD.attr(view,'checked','checked');
                view.value = yv;
            }else{
                view.removeAttribute('checked');
                view.value = DD.attr(view,'no-value'); 
            }
        }else if(tgname === 'select'){ //下拉框
            //option可能没生成，延迟执行
            setTimeout(function(){
                view.value = v;
            },0);
        }
    }

    
}());
