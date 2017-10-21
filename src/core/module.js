'use strict';

/**
 * @description 模块
 * @author  yanglei
 * @since   1.0.0
 */

(function(){
    /**
     * 添加模块，参数参见module定义
     * @param config    el:             element选择器
     *                  name:           moduleName
     *                  className:      模块类名
     *                  data:           数据
     *                  dataUrl:        数据地址
     *                  template:       模版
     *                  templateUrl:    模版文件
     *                  delayInit:      延迟初始化，默认false
     *                  needCompile:    是否需要编译，默认为true
     *                  onInit:         初始化后执行的函数(compile,data加载后)
     *                  onFirstRender:  首次渲染后执行的函数
     *                  onRender:       每次渲染后执行的函数  
     *                  requires:[]     模块依赖的文件，需要标明类型，默认为js，如[{type:'css',file:'path/1.css'},{type:'js',file:'path/1.js'}]
     *                  fromModules:[]  来源消息模块列表
     *                  methods:        方法集合
     */
    var Module = function(config){
        var me = this;
        me.name = config.name || 'DDModule_' + DD.genId();  // 模块名
        me.methodFactory = new DD.MethodFactory();          // 方法集合    
        me.modules = [];                                    // 子模块集合
        me.compiled = false;
        me.inited = false;
        me.onReceive = config.onReceive;
        me.onInit = config.onInit;    
        me.fromModules = config.fromModules;
        
        me.onRender = config.onRender;
        me.onFirstRender = config.onFirstRender;
        me.initConfig = DD.merge({delayInit:false},config);
        me.el = me.initConfig.el;
        //把方法添加到module对应的methodFactory
        if(!DD.isEmpty(config.methods)){
            DD.getOwnProps(config.methods).forEach(function(item){
                me.methodFactory.add(item,config.methods[item]);
            });
        }
        // 删除已处理的方法集
        delete config.methods;
        //初始化module
        if(!me.initConfig.delayInit){
            me.init(config);
        }
        //设置根module
        if(config.root === true){
            DD.App = me;
        }
        return me;
    }

    /**
     * 初始化
     */
    Module.prototype.init = function(callback){
        var me = this;
        var config = me.initConfig;
        //设置父module
        if(config.parent instanceof Module){
            me.parent = config.parent;
        }
        
        //创建virtualDom
        me.virtualDom = DD.newEl('div');
        var pview;  //父module view
        var view;   //当前模块在父module中的view   
        //如果父模块存在
        if(me.parent){
            //如果为字符串，则需要从模块工厂获取
            if(DD.isString(me.parent)){
                var mn = me.parent;
                me.parent = DD.moduleFactory.get(mn);
                if(!me.parent){
                    throw DD.Error.handle('notexist1',DD.words.module,mn);
                }
            }
            
            if(me.parent.$rendered){
                pview = me.parent.view;
            }else{
                pview = me.parent.virtualDom;
            }
        }else{ // 父视图
            pview = document.body;
        }
        
        view = DD.get(config.el,false,pview);
        //从父复制编译过的节点到virtualdom
        if(view && view.childNodes){
            DD.transChildren(view,me.virtualDom);
        }
        //调用模版和数据加载方法    
        me.load(function(data,tpl){
            //模版不为空，模版节点入virtualDom并进行编译
            if(!DD.isEmpty(tpl)){
                //把模版串形成的节点放入virtualdom
                var div = DD.newEl('div');
                div.innerHTML = tpl;
                DD.transChildren(div,me.virtualDom);
            }
            //编译
            me.compile();
            DD.Renderer.add(me);
            //有数据，添加到渲染列表
            if(data){
                new DD.Model({data:data,module:me});
            }
            
            //子模块初始化
            if(DD.isArray(config.modules)){
                config.modules.forEach(function(mc){
                    me.addModule(mc);
                });
            }
            
            //初始化事件
            if(DD.isFunction(config.onInit)){
                config.onInit.call(me.model);
            }
            
            // 初始化回调
            if(DD.isFunction(callback)){
                callback(me);
            }
            //删除initConfig
            delete me.initConfig;
        });
        me.inited = true;
    }

    /**
     * 加载模块
     * @param callback  加载后的回调函数
     */
    Module.prototype.load = function(callback){
        var me = this;
        var config = me.initConfig;
        //资源加载数
        var reqCnt = 0;
        //模块数据
        var mdlData;
        //模版串
        var mdlTpl;
        loadRequireRes();
        //如果不存在加载，则直接执行回调
        if(reqCnt === 0){
            checkCB();
        }
        function checkCB(){
            if(DD.isFunction(callback) && reqCnt===0){
                callback(mdlData,mdlTpl);
            }
        }
        /**
         * 加载require资源
         */
        function loadRequireRes(){
            if(DD.isArray(config.requires) && config.requires.length>0){
                config.requires.forEach(function(item,i){
                    var type = 'js';
                    var path;
                    if(DD.isObject(item)){
                        path=item.path;
                        type = item.type || type;
                    }else if(typeof item === 'string'){
                        path = item;
                    }

                    switch(type){
                        case 'css': //css
                            DD.load('css',path);
                            break;
                        default:   //js
                            reqCnt++;
                            DD.load('js',path,function(){
                                if(--reqCnt === 0){
                                    loadModuleRes();
                                }
                            });
                    }
                });
                // 如果require加载完成，则加载module资源
                if(reqCnt === 0){
                    loadModuleRes();
                }
            }else{
                loadModuleRes();
            }
        }


        /**
         * 加载模块资源 data、template
         */
        function loadModuleRes(){
            //数据
            if(DD.isObject(config.data)){
                mdlData = config.data;
            }else if(!DD.isEmpty(config.dataUrl)){      //加载数据
                //清掉数据
                me.setData({});
                reqCnt++;
                DD.request({
                    url:config.dataUrl,
                    type:'json',
                    successFunc:function(r){
                        mdlData = r;
                        if(--reqCnt === 0){
                            checkCB();    
                        }
                    }
                });
            }
            
            //模版串
            if(!DD.isEmpty(config.template)){                   //template string
                mdlTpl = config.template;
            }else if(!DD.isEmpty(config.templateUrl)){          //template file
                var path = config.templateUrl;
                if(DD.config && !DD.isEmpty(DD.config.appPath)){
                    path = DD.config.appPath + '/' + path;
                }
                reqCnt++;
                DD.request({
                    url:path,
                    successFunc:function(r){
                        mdlTpl = r;
                        if(--reqCnt === 0){
                            checkCB();
                        }
                    }
                });
            }
        }
    }
        
    /**
     * 编译模版或element
     * @param view 指定的view，可选，默认为virtualDom
     */
    Module.prototype.compile = function(dstView){
        var me = this;
        var cls;
        //ddr 是否有module class存在，则需要先检查class是否存在virtualDom，如果存在，则不用再编译，否则把模块的virturalDom编译了给class
        if(me.className && (cls = DD.Module.getClass(me.className))!==undefined && cls.virtualDom){
            me.virtualDom = cls.virtualDom;
            return;
        }

        //编译
        if(dstView){
            compileEl(dstView);
        }else{
            var vd = compileEl(me.virtualDom);
            if(cls !== undefined){
                cls.virtualDom = vd;
            }
            me.compiled = true;
        }
        
        /**
         * 编译单个element
         * @param el    待编译的element
         * @return      编译后的element
         */
        function compileEl(el){
            //扩展element方法
            DD.merge(el,DD.extendElementConfig);
            // 指定模块
            el.$module = me;
            
            //处理属性指令
            DD.getAttrsByValue(el,/\{\{.+?\}\}/).forEach(function(attr){
                me.needData = true;
                // 保存带表达式的属性
                el.$attrs[attr.name]=DD.Expression.initExpr(attr.value,el);
            });
            
            //初始化指令集
            DD.Directive.initViewDirectives(el);
            if(el.$hasDirective('model')){
                me.needData = true;
            }
            
            //遍历childNodes进行指令、表达式、路由的处理
            var nodes = el.childNodes;
            for(var i=0;i<nodes.length;i++){
                var node = nodes[i];
                switch(node.nodeType){
                    case Node.TEXT_NODE:        // 文本
                        // 处理文本表达式
                        if(node.textContent.trim() !== ''){
                            if(/\{\{.+\}\}?/.test(node.textContent)){
                                me.needData = true;
                                //处理表达式
                                node.$exprs = DD.Expression.initExpr(node.textContent,me);
                                //textcontent 清空
                                node.textContent = ' ';
                            }    
                        }
                        
                        break;
                    case Node.COMMENT_NODE:     // 注释，需要移除
                        el.removeChild(node);
                        i--;
                        break;
                    default:                    // 标签 Node.ELEMENT_NODE
                        compileEl(node);
                }
            }
            return el;
        }
    }
    /**
     * 渲染
     * @param container     容器
     * @param data          数据
     */
    Module.prototype.render = function(container,data){
        var me = this;
        //未编译，不渲染
        if(!me.compiled){
            return false;
        }
        // 获取渲染容器
        getView(me);
        //找不到view，返回
        if(!DD.isEl(me.view)){
            return true;
        }
        //设置模块view为view
        if(!me.view.$isView){
            DD.merge(me.view,DD.extendElementConfig);
            me.view.$isView = true;
        }
        if(me.needData && !me.model){
            return false;
        }

        //设置清除upd标志
        if(me.view.childNodes.length === 0){ //没渲染过，从virtualDom渲染
            //用克隆节点操作，不影响源节点
            var cloneNode = DD.cloneNode(me.virtualDom);
            //把cloneNode下的所有节点渲染到view
            renderDom(cloneNode,true);
            //把clone后的子节点复制到模块的view
            DD.transChildren(cloneNode,me.view);
            me.view.$containModule = true;  //设置view为module容器
            //触发首次渲染事件
            if(!me.rendered && DD.isFunction(me.onFirstRender)){
                me.onFirstRender.call(me.model);
            }
            //设置已渲染标志
            me.rendered = true;
        }else{  //渲染过，从view渲染
            renderDom(me.view,true);
        }
        //调用onRender事件
        if(DD.isFunction(me.onRender)){
            me.onRender.call(me.model);
        }
        //清除data中的oldValue
        if(me.model){
            me.model.clean();
        }
        //渲染子节点
        if(me.renderChildren){
            me.modules.forEach(function(m){
                m.renderChildren = true;
                m.render();
            });
            //删除渲染子节点标志
            delete me.renderChildren;
        }
        //删除强制渲染标志
        delete me.forceRender;
        //路由链式加载
        if(DD.Router){
            setTimeout(
                function(){
                    //设置加载完标志
                    DD.Router.setRouteFinish(me);
                    DD.Router.linkLoad();
                },0
            );
        }
        //渲染成功
        return true;
        
        /**
         * 渲染virtual dom
         * @param node      待渲染节点
         * @param isRoot    是否为根节点
         */
        function renderDom(node,isRoot){
            //判断并设置routerview
            if(node.$isRouterView === true){
                me.routerView = node;
            }
            //如果不需要数据或者为子模块，不渲染
            if(node.needData === false || node !== me.view && node.$containModule){
                return;
            }
            //设置$module
            if(!isRoot){
                node.$module = me;    
            }
            
            if(node.$isView){
                //未渲染，则进行事件初始化
                if(!node.$rendered && DD.isEl(node)){
                    initEvents(node);
                }
                var model = node.$getData();
                //有数据才进行渲染
                if(model.data && model.data.$changed || node.$forceRender || me.forceRender){
                    if(DD.isEl(node)){
                        //增加渲染过程变量
                        var directives = [];
                        DD.getOwnProps(node.$attrs).forEach(function(attr){
                            if(typeof(node.$attrs[attr]) === 'function'){
                                return;
                            }
                            var r = DD.Expression.handle(me,node.$attrs[attr],model);
                            //如果字段没修改且没有设置强制渲染，则不设置属性
                            if(!r[0] && !node.$forceRender){
                                return;
                            }
                            var v = r[1];
                            //指令属性不需要设置属性值
                            if(attr.substr(0,2) === 'x-'){
                                directives.push({
                                    name:attr.substr(2),
                                    value:v
                                });
                            }else {  //普通属性
                                DD.attr(node,attr,v);
                            }
                        });
                        //指令属性修改后，需要重新初始化指令
                        if(directives.length > 0){
                            DD.Directive.initViewDirective(node,directives);
                        }
                    }
                    //处理指令
                    if(node.$directives.length>0){
                        DD.Directive.handle(node);     
                    }
                }
                //渲染子节点
                //隐藏节点不渲染子节点
                // var showDir = node.$getDirective('show');
                // if((!showDir || showDir.yes) && node.childNodes){
                    for(var i=0;i<node.childNodes.length;i++){
                        //子element或 自己的data修改后的文本子节点
                        if(node.$isView || model.data.$changed){
                            renderDom(node.childNodes[i]);    
                        }
                    }
                // }
                //设置渲染标志
                node.$rendered = true;
                //删除forceRender属性
                delete node.$forceRender;
            }else if(me.model && me.model.data && node.nodeType === Node.TEXT_NODE && node.$exprs){
                var model = node.parentNode.$getData();
                //model changed 或 forcerender 才进行渲染
                if(model.data && model.data.$changed || node.parentNode.$forceRender || me.forceRender){
                    var r = DD.Expression.handle(me,node.$exprs,model); 
                    //数据未修改，forceRender为false，不渲染
                    if(!r[0] && !node.parentNode.$forceRender && !me.forceRender){
                        return;
                    }

                    //清除之前渲染的节点
                    var bn = node.nextSibling;
                    for(;bn && bn.$genNode;){
                        var n = bn.nextSibling;
                        DD.remove(bn);
                        bn = n;
                    }
                    var hasEl = /[(\&lt;.*?\&gt;)(\<.*?\>)]/.test(r[1]);
                    //如果只是text，则添加文本，否则编译后追加到textnode后面
                    if(!hasEl){
                        node.textContent = r[1];
                    }else{
                        var div = document.createElement('div');
                        div.innerHTML = r[1];
                        // 新增el，需要编译
                        me.compile(div);
                        var frag = document.createDocumentFragment();
                        for(var i=0;i<div.childNodes.length;){
                            var n = div.childNodes[i];
                            n.$genNode = true;
                            frag.appendChild(div.childNodes[i]);
                        }
                        DD.insertAfter(frag,node);
                    }
                }
            }
            return node;
        }

        /**
         * 获取view
         */
        function getView(module){
            //此处需增加处理路由器view
            if(!module.view){
                if(module.parent){
                    // 父view不存在，级联上找
                    if(!module.parent.view){
                        getView(module.parent);
                    }
                    if(module.parent.view){
                        module.view = DD.get(module.el,false,module.parent.view);
                    }
                }else{
                    module.view = DD.get(module.el,false,document.body);
                }
            }
            return module.view;
        }

        /**
         * 初始化事件
         */
        function initEvents(el){
            var attrs = DD.getAttrs(el,/^e-/);
            if(attrs.length>0){
                attrs.forEach(function(attr){
                    //处理管道
                    var arr = attr.value.split(':');
                    var handler = me.methodFactory.get(arr[0]);
                    //如果不存在事件方法，则不处理，可能是子模块方法，留给子模块处理
                    if(!handler){
                        return;
                    }
                    //去掉e-前缀
                    var ename = attr.name.substr(2);
                    
                    //处理多个参数
                    var param = {
                        view:el,
                        eventName:ename,
                        handler:handler
                    };
                    if(arr.length>1){
                        for(var i=1;i<arr.length;i++){
                            param[arr[i]] = true;
                        }
                    }
                    //新建事件并绑定
                    new DD.Event(param);
                    //移除事件属性
                    el.removeAttribute(attr.name);
                });
            }
        }
    }
    /**
     * 销毁
     */
    Module.prototype.destroy=function(){
        delete DD.Module.moduleFactory[this.name];
        DD.Renderer.remove(this);
    }
    /**
     * 添加子模块
     * @param moduleName    模块名
     * @param config        配置
     * @return              新建的module
     */
    Module.prototype.addModule=function(config){
        var me = this;
        if(!DD.isObject(config)){
            throw DD.Error.handle('invoke1','addModule',0,'object');
        }
        config.parent = me;
        var m = DD.Module.newInstance(config);
        me.modules.push(m);
        return m;
    }
    
    /**
     * 手动为模块设置数据
     * @param data  待设置的数据
     */
    Module.prototype.setData = function(data){
        var me = this;
        //复制模块中$开头的数据，这些数据是系统数据
        if(me.model && !DD.isEmpty(me.model.data)){
            DD.getOwnProps(me.model.data).forEach(function(item){
                if(item[0] === '$'){
                    data[item] = me.model.data[item]; 
                }
            });
        }
        //清理所有子view数据
        new DD.Model({data:data,module:me});
    }

    /**
     * 广播，向兄弟和父模块广播
     * @param data    广播的数据
     */
    Module.prototype.broadcast = function(data){
        var me = this;
        var mname = me.name;
        var mdls = [];
        if(me.parent){
            // 父模块
            mdls.push(me.parent);
            //兄弟节点
            mdls = mdls.concat(me.parent.modules);
        } 
        //子模块
        mdls = mdls.concat(me.modules);
        mdls.forEach(function(m){
            if(m === me){
                return;
            }
            if(DD.isFunction(m.onReceive)){
                var call = true;
                //如果fromModules 是数组且不为空，则要判断是否要接收该module发送来的消息
                if(DD.isArray(m.fromModules) && m.fromModules.length !== 0){
                    if(m.fromModules.indexOf(mname) === -1){
                        call = false;
                    }
                }
                if(call){
                    m.onReceive.call(m.model,mname,data);
                }
            }
        });
    },

    /**
     * 向指定模块发送消息
     * @param moduleName    模块名
     * @param data          数据 
     */
    Module.prototype.send = function(moduleName,data){
        if(!DD.isString(moduleName)){
            throw DD.Error.handle('invoke','send','string');
        }
        if(data === undefined){
            throw DD.Error.handle('invoke','send','not null');
        }

        var module = DD.Module.get(moduleName);
        if(!module){
            throw DD.Error.handle('notexist1',DD.words.module,moduleName);   
        }
        if(DD.isFunction(module.onReceive)){
            module.onReceive.call(module.model,this.name,data);
        }
    }

    /**
     * 设置强制渲染
     * @param flag  true／false
     */
    Module.prototype.setForceRender = function(flag){
        var me = this;
        me.forceRender = flag;
        me.modules.forEach(function(m){
            m.setForceRender(flag);
        });
    }
    
    /**
     * 扩展DD.Module
     */
    DD.assign(Module,{
        classFactory:{},     //类工厂
        moduleFactory:{},    //模块集
        /**
         * 定义模块类
         * @param config    配置
         *          className:      类名
         *          extend:         父类名
         *          template:       模版
         *          templateUrl:    模版文件路径 
         *          methods:        方法集
         *          onReceive:      方法接收处理函数
         */
        define:function(config){
            var me = this;
            var cname = config.className;
            if(!cname){
                throw DD.Error.handle('invoke','define','string');
            }
            if(me.classFactory[cname]){
                throw DD.Error.handle('exist1',DD.words.moduleClass,cname);
            }
            //存储类
            me.classFactory[cname] = DD.merge({virtualDom:null},config);
            return me.classFactory[cname];
        },

        /**
         * 获取class
         * @param clsName   类名
         * @return          类或null
         */
        getClass:function(clsName){
            return this.classFactory[clsName];
        },
        /**
         * 实例化一个模块
         * @param config    配置
         *          name:       模块名
         *          className:  类名 
         * @return 新建的模块
         */
        newInstance:function(config){
            var me = this;
            //判断该名字是否存在
            if(config.name && me.get(config.name)){
                throw DD.Error.handle('exist1',DD.words.module,config.name);   
            }
            var param;
            if(!DD.isEmpty(config.className)){
                var cls = me.getClass(config.className);
                if(cls !== undefined){
                    param = DD.extend({},cls,config);
                }
            }else{
                param = config;
            }
            // 模块实例化
            var m = new DD.Module(param);
            // 添加到模块集
            me.moduleFactory[m.name] = m;
            return m;
        },

        /**
         * 获取模块
         * @param mname     模块名
         * @return          模块
         */
        get:function(mname){
            return this.moduleFactory[mname];
        }
    });

    //扩展DD，增加module相关
    DD.assign(DD,{
        createModule:function(config){
            if(DD.isArray(config)){
                config.forEach(function(cfg){
                    DD.Module.newInstance(cfg);
                })
            }else{
                return DD.Module.newInstance(config);
            }
        },
        defineModule:function(config){
            return DD.Module.define(config);
        }
    });
    
    DD.Module = Module;
}());
