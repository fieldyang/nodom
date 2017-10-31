'use strict';

/**
 * @description 基础服务库
 * @author      yanglei
 * @since       1.0.0
 * @create      2016-09-28
 */
var DD = {
    //唯一主键
    generatedId:1,
    genId:function(){
        return this.generatedId++;
    },
    
    /******对象相关******/

    /**
     * 扩展对象,并返回
     */
    extend:function(){
        var args = arguments;
        var reto = args[0];
        for(var i=1;i<args.length;i++){
            if(typeof args[i] === 'object'){
                var obj = args[i];
                for(var prop in obj){
                    if(typeof obj[prop] === 'object'){
                        if(typeof reto[prop] === 'object'){
                            reto[prop] = DD.merge(reto[prop],obj[prop]);
                        }else{
                            reto[prop] = DD.merge({},obj[prop]);
                        }
                    }else{
                        reto[prop] = obj[prop];
                    }
                }
            }
        }
        return reto;
    },

    merge:function(obj1,obj2){
        if(typeof obj1 !== 'object'){
            throw DD.Error.handle('invoke','DD.merge',0,'object');
        }
        if(typeof obj2 !== 'object'){
            throw DD.Error.handle('invoke','DD.merge',1,'object');
        }
        //用于存储已复制的对象
        var copyed = [];
        merge(obj1,obj2);
        return obj1;
        
        function merge(obj1,obj2){
            //复制过的对象不重复复制
            if(copyed.indexOf(obj2) !== -1){
                return obj2;
            }
            //记录复制过的对象属性
            copyed.push(obj2);
            //数组，处理每个数组元素
            if(DD.isArray(obj1) && DD.isArray(obj2)){
                obj2.forEach(function(item,i){
                    if(DD.isArray(item)){
                        obj1[i] = merge([],item);    
                    }else if(DD.isObject(item)){
                        obj1[i] = merge({},item);
                    }else{
                        obj1[i] = item;
                    }
                });
            }else {  //对象，处理每个属性
                for(var o in obj2){
                    //凡是出现parent，则直接复制，否则可能会
                    if(DD.isObject(obj2[o])){       //处理对象
                        if(!DD.isObject(obj1[o])){
                            obj1[o] = {};
                        }
                        merge(obj1[o],obj2[o]);
                    }else if(DD.isArray(obj2[o])){  //处理数组
                        if(!DD.isArray(obj1[o])){
                            obj1[o] = [];
                        }
                        obj2[o].forEach(function(item,i){
                            var ro;
                            if(DD.isObject(item)){
                                ro = merge({},item);
                            }else if(DD.isArray(item)){
                                ro = merge([],item);
                            }else{
                                ro = item;
                            }
                            obj1[o][i] = ro;
                        });
                    }else if(obj2[o] !== undefined){
                        obj1[o] = obj2[o];
                    }
                }
            }
            return obj1;
        }
    },

    /**
     * 把obj2对象所有属性赋值给obj1
     */
    assign:function(obj1,obj2){
        if(Object.assign){
            Object.assign(obj1,obj2);
        }else{
            DD.getOwnProps(obj2).forEach(function(p){
                obj1[p] = obj2[p];
            });    
        }
    },

    /**
     * 获取对象自有属性
     */
    getOwnProps:function(obj){
        if(!obj){
            return [];
        }
        return Object.getOwnPropertyNames(obj);
    },
    /**************对象判断相关************/
    /**
     * 是否为函数
     * @param foo   检查的对象
     * @return true/false
     */
    isFunction:function(foo){
        return foo !== undefined && foo !== null && foo.constructor === Function;
    },
    /**
     * 是否为数组
     * @param obj   检查的对象
     * @return true/false
     */
    isArray:function(obj) {
        return obj !== undefined && obj !== null && obj.constructor === Array;
    },

    /**
     * 是否为对象
     * @param obj   检查的对象
     * @return true/false
     */
    isObject: function(obj) {
        return obj !== null && obj !== undefined && obj.constructor === Object;
    },

    /**
     * 判断是否为整数
     */
    isInt: function (x) {
        return Number.isInteger(x);
    },

    /**
     * 判断是否为number
     */
    isNumber:function(v){
        return typeof v === 'number';
    },

    /**
     * 判断是否为boolean
     */
    isBoolean:function(v){
        return typeof v === 'boolean';
    },
    /**
     * 判断是否为字符串
     */
    isString: function(str){
        return typeof str === 'string';
    },

    /**
     * 对象/字符串是否为空
     * @param obj   检查的对象
     * @return true/false
     */
    isEmpty:function(obj){
        if(obj === null || obj === undefined)
            return true;
        var tp = typeof obj;
        if(DD.isObject(obj)){
            var keys = Object.keys(obj);
            if(keys !== undefined){
                return keys.length === 0;
            }
        }else if(tp === 'string'){
            return obj === '';
        }
        return false;
    },


   /**********dom相关***********/
    /**
     * 获取dom节点
     * @param selector  选择器
     * @param findAll   是否获取所有，默认为false
     * @param pview     父对象
     * @return element/null 或 element数组/[]
     */
    get:function(selector,findAll,pview){
        pview = pview || document;
        if(findAll === true){
            return pview.querySelectorAll(selector);
        }
        return pview.querySelector(selector);
    },

    /**
     * 追加子节点
     * @param el    父element
     * @param dom   要添加的dom节点或dom串
     */
    append:function(el,dom){
        if(DD.isNode(dom)){
            el.appendChild(dom);
        }else if(DD.isString(dom)){
            var div = DD.newEl('div');
            div.innerHTML = dom;
            DD.transChildren(div,el);
        }
    },
    /**
     * 是否为element
     * @param el 传入的对象
     * @return true/false
     */
    isEl:function(el){
        return el !== undefined && el !== null && el.nodeType === Node.ELEMENT_NODE;
    },

    /**
     * 是否为node
     * @param node 传入的对象
     * @return true/false
     */
    isNode:function(node){
        return node !== undefined && node !== null && (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE);  
    },
    /**
     * 复制节点，并复制view属性
     * @param el    待克隆 el
     */
    cloneNode:function(el){
        if(!DD.isNode(el)){
            throw DD.Error.handle('invoke','DD.cloneNode',0,'Node');
        }
        var node;
        node = el.cloneNode(true);
        DD.copyProp(node,el);
        return node;
    },

    /**
     * 复制node自定义属性
     * @param nod1  目标node
     * @param nod2  源node
     */
    copyProp:function(nod1,nod2){
        var po = {};
        if(!nod1 || !nod2){
            return;
        }
        var notCloneArr = ['$model','$module','$events'];
        //复制自定义属性
        DD.getOwnProps(nod2).forEach(function(p){
            if(p[0] === '$'){
                var flag = false;
                for(var i=0;i<notCloneArr.length;i++){
                    if(p === notCloneArr[i]){
                        flag = true;
                        break;
                    }
                }
                if(!flag){
                    po[p] = nod2[p];
                }
            }
        });
        DD.merge(nod1,po);
        //$model要单独处理
        nod1.$module = nod2.$module;
        //先把事件清空
        nod1.$events = {};
        //复制model
        if(nod2.$model){
            nod1.$model = {};
            DD.getOwnProps(nod2.$model).forEach(function(item){
                nod1.$model[item] = nod2.$model[item];
            });
        }
        //处理事件
        if(!DD.isEmpty(nod2.$events)){
            DD.getOwnProps(nod2.$events).forEach(function(e){
                var eo = nod2.$events[e];
                if(eo instanceof DD.Event){
                    var module = eo.module;
                    eo.view = nod1;    
                    delete eo.module;
                    var p = DD.merge({},eo);
                    new DD.Event(p);
                }
            });
        }
        //处理子孙节点
        for(var i=0;i<nod1.childNodes.length;i++){
            DD.copyProp(nod1.childNodes[i],nod2.childNodes[i]);
        }
    },
    /**
     * 获取属性数组
     * @param   el  element
     * @param   reg 正则式
     * @return  属性数组
     */
    getAttrs:function(el,reg){
        if(!DD.isEl(el)){
            throw DD.Error.handle('invoke','DD.getAtrs',0,'element');
        }
        var arr = [];
        for(var i=0;i<el.attributes.length;i++){
            var attr = el.attributes[i];
            if(reg.test(attr.name)){
                arr.push(attr);
            }
        }
        return arr;
    },

    /**
     * 通过属性值获取属性列表
     * @param el    element
     * @param reg   正则表达式
     */
    getAttrsByValue:function(el,reg){
        if(!DD.isEl(el)){
            throw DD.Error.handle('invoke','DD.getAttrsByValue',0,'element');
        }
        if(!reg instanceof RegExp){
            throw DD.Error.handle('invoke','DD.getAttrsByValue',1,'RegExp');   
        }
        var arr = [];

        for(var i=0;i<el.attributes.length;i++){
            var attr = el.attributes[i];
            if(reg.test(attr.value)){
                arr.push(attr);
            }
        }
        return arr;
    },
    /**
     * 复制element 属性
     * @param srcEl     源element
     * @param dstEl     目标element
     */
    copyAttrs:function(srcEl,dstEl){
        if(!DD.isEl(srcEl)){
            throw DD.Error.handle('invoke','DD.copyAttrs',0,'element');
        }
        if(!DD.isEl(dstEl)){
            throw DD.Error.handle('invoke','DD.copyAttrs',1,'element');
        }
        for(var i=0;i<srcEl.attributes.length;i++){
            var attr = srcEl.attributes[i];
            dstEl.setAttribute(attr.name,attr.value);
        }
    },
    /**
     * 新建dom
     * @param tagName   标签名
     * @param config    属性集合
     * @param text      innerText
     * @return 新建的elelment
     */
    newEl:function(tagName,config,text){
        if(!DD.isString(tagName) || DD.isEmpty(tagName)){
            throw DD.Error.handle('invoke','DD.newEl',0,'string');   
        }
        var el = document.createElement(tagName);
        if(DD.isObject(config)){
            DD.attr(el,config);
        }else if(DD.isString(text)){
            el.innerHTML = text;
        }
        return el;
    },
    /**
     * 新建svg element
     * @param tagName   标签名
     * @return          svg element
     */
    newSvgEl : function(tagName){
        return document.createElementNS("http://www.w3.org/2000/svg",tagName);
    },
    /**
     * 把srcNode替换为nodes
     * @param srcNode       源dom
     * @param nodes         替换的dom或dom数组
     * @param srcPropCopy   是否保留原有dom的扩展view参数，缺省true
     */
    replaceNode:function(srcNode,nodes,srcPropCopy){
        if(!DD.isNode(srcNode)){
            throw DD.Error.handle('invoke','DD.replaceNode',0,'Node');
        }
        
        if(!DD.isNode(nodes) && !DD.isArray(nodes)){
            throw DD.Error.handle('invoke1','DD.replaceNode',1,'Node','Node Array');
        }

        var pnode = srcNode.parentNode;
        var bnode = srcNode.nextSibling;
        if(pnode === null){
            return;
        }
        pnode.removeChild(srcNode);
        if(!DD.isArray(nodes)){
            nodes = [nodes];
        }
        
        nodes.forEach(function(node){
            if(bnode === undefined || bnode === null){
                pnode.appendChild(node);
            }else{
                pnode.insertBefore(node,bnode);
            }
            if(srcPropCopy !== false){
                srcPropCopy = true;
            }
            // 扩展node处理 参数复制
            if(srcPropCopy && srcNode.$isView){
                DD.copyProp(node,srcNode);
            }
        });
    },
    /**
     * 在srcNode后面插入newNode,如果srcNode无效，则插入到第一个
     * @param newNode   新节点或数组
     * @param oldNode   旧节点
     */
    insertAfter:function(newNode,srcNode,pNode){
        var me = this;
        if(!DD.isNode(newNode)){
            throw DD.Error.handle('invoke','DD.insertAfter',0,'Node');
        }
        if(!DD.isNode(srcNode) && !DD.isNode(pNode)){
            throw DD.Error.handle('invoke2','DD.insertAfter',1,2,'Node');
        }
        var bNode=null;
        //如果srcNode不存在，则添加在第一个位置
        if(srcNode === undefined || srcNode === null){
            bNode = pNode.firstChild;
        }else{
            pNode = srcNode.parentNode;
            bNode = srcNode.nextSibling;
        }
        if(!DD.isNode(pNode)){
            return;
        }
        if(bNode === null){
            if(DD.isArray(newNode)){
                newNode.forEach(function(n){
                    if(me.isEl(n)){
                        pNode.appendChild(n);
                    }
                });
            }else{
                pNode.appendChild(newNode);
            }
        }else{
            if(DD.isArray(newNode)){
                newNode.forEach(function(n){
                    if(me.isEl(n)){
                        pNode.insertBefore(n,bNode);
                    }
                });
            }else{
                pNode.insertBefore(newNode,bNode);
            }
        }
    },

    /**
     * 清空子节点
     * @param el
     */
    empty:function(el){
        var me = this;
        if(!me.isEl(el)){
            throw DD.Error.handle('invoke','DD.empty',0,'Element');
        }
        var nodes = el.childNodes;
        for(var i=nodes.length-1;i>=0;i--){
            el.removeChild(nodes[i]);
        }
    },
    /**
     * 删除自己
     * @param node
     */
    remove:function(node){
        var me = this;
        if(!me.isNode(node)){
            throw DD.Error.handle('invoke','DD.remove',0,'Node');
        }
        if(node.parentNode !== null){
            node.parentNode.removeChild(node);
        }
    },
    /**
     * 复制子节点
     * @param el    element
     * @return  返回复制的子节点数组
     */
    copyChildren:function(el){
        var me = this;
        if(!me.isEl(el)){
            throw DD.Error.handle('invoke','DD.copyChildren',0,'Element');
        }
        var nodes = el.childNodes;
        var arr = [];
        for(var i=nodes.length-1;i>=0;i--){
            arr.push(nodes[i]);
        }
        return arr;
    },

    /**
     * 转移孩子节点
     * @param srcEl 源父节点
     * @param dstEl 目的父节点
     */
    transChildren:function(srcEl,dstEl){
        var me = this;
        if(!me.isEl(srcEl)){
            throw DD.Error.handle('invoke','DD.copyChildren',0,'Element');
        }
        if(!me.isEl(dstEl)){
            throw DD.Error.handle('invoke','DD.copyChildren',1,'Element');
        }
        //通过fragment 转移，减少渲染
        var frag = document.createDocumentFragment();
        for(;srcEl.childNodes.length>0;){
            frag.appendChild(srcEl.childNodes[0]);
        }
        dstEl.appendChild(frag);
    },

    /**
     * 获取／设置属性
     * @param el    element
     * @param param 属性名，设置多个属性时用对象
     * @param value 属性值，获取属性时不需要设置
     */
    attr:function(el,param,value){
        var me = this;
        if(!me.isEl(el)){
            throw DD.Error.handle('invoke','DD.attr',0,'Element');
        }
        if(DD.isEmpty(param)){
            throw DD.Error.handle('invoke','DD.attr',1,'string','object');   
        }
        if(value === undefined || value === null){
            if(DD.isObject(param)){ //设置多个属性
                DD.getOwnProps(param).forEach(function(k){
                    if(k === 'value'){
                        el[k] = param[k];
                    }else{
                        el.setAttribute(k,param[k]);
                    }
                });
            }else if(DD.isString(param)){ //获取属性
                if(param === 'value'){
                    return param.value
                }
                return el.getAttribute(param);
            }
        }else { //设置属性
            if(param === 'value'){
                    el[param] = value;
            }else{
                el.setAttribute(param,value);
            }
        }
    },
    /**
     * 设置样式
     * @param el    element
     * @param name  样式名，设置多个样式时用对象
     * @param value 样式值，获取样式时不需要设置
     */
    css:function(el,name,value){
        var me = this;
        if(!me.isEl(el)){
            throw DD.Error.handle('invoke','DD.css',0,'Element');
        }
        if(DD.isEmpty(name)){
            throw DD.Error.handle('invoke1','DD.css',1,'string','object');   
        }
        var compStyle;
        //ie 9+ firefox chrome safari
        if(window.getComputedStyle){
            compStyle = window.getComputedStyle(el,null);
        }
        if(!compStyle){
            return;
        }

        if(value === undefined || value === null){
            if(DD.isObject(name)){ //设置多个属性
                DD.getOwnProps(name).forEach(function(k){
                    if(DD.cssconfig !== undefined && DD.cssconfig[k] !== undefined){
                        //遍历属性名数组
                        DD.cssconfig[k].forEach(function(sn){
                             el.style[sn] = name[k];
                        });
                    }else{
                        el.style[k] = name[k];
                    }
                });
            }else{ //获取样式
                return compStyle[name];
            }
        }else { //设置属性
            if(DD.$cssconfig !== undefined && DD.$cssconfig[name] !== undefined){
                //遍历属性名数组
                DD.$cssconfig[name].forEach(function(sn){
                     el.style[sn] = value;
                });
            }else{
                el.style[name] = value;
            }
        }
    },
    /**
     * 获取或设置宽度
     * @param el        elment
     * @param value     如果为false，则获取外部width(含padding)，否则获取内部width，如果为数字，则设置width + px
     */
    width:function(el,value){
        if(!DD.isEl(el)){
            throw DD.Error.handle('invoke','DD.width',0,'Element');
        }
        if(DD.isNumber(value)){
            el.style.width = value + 'px';
        }else{
            var compStyle;
            //ie 9+ firefox chrome safari
            if(window.getComputedStyle){
                compStyle = window.getComputedStyle(el,null);
            }
            if(!compStyle){
                return null;
            }
            var w = parseInt(compStyle['width']);
            if(value === true){
                var pw = parseInt(compStyle['paddingLeft'])+parseInt(compStyle['paddingRight']);
                w -= pw;    
            }
            return w;
        }
    },
    height:function(el,value){
        if(!DD.isEl(el)){
            throw DD.Error.handle('invoke','DD.height',0,'Element');
        }
        if(DD.isNumber(value)){
            el.style.height = value + 'px';
        }else{
            var compStyle;
            //ie 9+ firefox chrome safari
            if(window.getComputedStyle){
                compStyle = window.getComputedStyle(el,null);
            }
            if(!compStyle){
                return null;
            }
            var w = parseInt(compStyle['height']);
            if(value === true){
                var pw = parseInt(compStyle['paddingTop'])+parseInt(compStyle['paddingBotto,']);
                w -= pw;    
            }
            return w;
        }
    },
    /**
     * 添加class
     * @param el		element
     * @param cls	类名
     */
    addClass:function(el,cls){
        if(!DD.isEl(el)){
            throw DD.Error.handle('invoke','DD.addClass',0,'Element');
        }
        if(DD.isEmpty(cls)){
            throw DD.Error.handle('invoke','DD.addClass',1,'string');   
        }

		var cn = el.className.trim();
		if(DD.isEmpty(cn)){
			el.className = cls;
		}else{
			var arr = cn.split(/\s+/);
			//遍历class数组，如果存在cls，则不操作
			for(var i=0;i<arr.length;i++){
				if(arr[i] === cls){
					return;
				}
			}
			//追加cls
			arr.push(cls);
			el.className = arr.join(' ');
		}
    },
    /**
     * 移除cls
     * @param el		element
     * @param cls	类名
     */
    removeClass:function(el,cls){
    	if(!DD.isEl(el)){
            throw DD.Error.handle('invoke','DD.removeClass',0,'Element');
        }
        if(DD.isEmpty(cls)){
            throw DD.Error.handle('invoke','DD.removeClass',1,'string');   
        }

		var cn = el.className.trim();
		if(!DD.isEmpty(cn)){
			var arr = cn.split(/\s+/);
			//遍历class数组，如果存在cls，则移除
			for(var i=0;i<arr.length;i++){
				if(arr[i] === cls){
					arr.splice(i,1);
					el.className = arr.join(' ');
					return;
				}
			}
		}
    },

    /******日期相关******/
    /**
     * 日期格式化
     * @param srcDate   原始日期
     * @param format    日期格式
     * @return          日期串
     */
    formatDate:function(srcDate,format){
        if(DD.isString(srcDate)){
            //排除日期格式串,只处理时间戳
            var reg = new RegExp(/^\d+$/);
            if(reg.exec(srcDate) !== null){
                try{
                    srcDate = parseInt(srcDate);
                }catch(e){}    
            }
        }
            
        //得到日期
        var srcDate = new Date(srcDate);
        // invalid date
        if(isNaN(srcDate.getDay())){
            throw DD.Error.handle('invoke','DD.formatDate',0,'date string','date');
        }

        var o = {
            "M+" : srcDate.getMonth()+1, //月份
            "d+" : srcDate.getDate(), //日
            "h+" : srcDate.getHours()%12 === 0 ? 12 : srcDate.getHours()%12, //小时
            "H+" : srcDate.getHours(), //小时
            "m+" : srcDate.getMinutes(), //分
            "s+" : srcDate.getSeconds(), //秒
            "q+" : Math.floor((srcDate.getMonth()+3)/3), //季度
            "S" : srcDate.getMilliseconds() //毫秒
        };
        var week = {
            "0" : "日",
            "1" : "一",
            "2" : "二",
            "3" : "三",
            "4" : "四",
            "5" : "五",
            "6" : "六"
       };
       //年份单独处理
       if(/(y+)/.test(format)){
           format=format.replace(RegExp.$1, (srcDate.getFullYear()+"").substr(4 - RegExp.$1.length));
       }
       //月日
       DD.getOwnProps(o).forEach(function(k){
           if(new RegExp("("+ k +")").test(format)){
               format = format.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
           }
       });

       //星期
       if(/(E+)/.test(format)){
           format=format.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "") + week[srcDate.getDay() + ""]);
       }
       return format;
    },

    /**
     * 日期串转日期
     * @param dateStr   日期串
     * @return          日期
     */
    toDate:function(dateStr){
        var date1;
        try{
            date1 = new Date(Date.parse(dateStr));
        }catch(e){

        }
        if(!date1){
            throw DD.Error.handle('invoke','DD.toDate',0,'date string');
        }

        //处理非标准日期串
        //14位
        if(isNaN(date1) || isNaN(date1.getDay())){
            if(dateStr.length === 14){
                dateStr = dateStr.substr(0,4) + '/' + dateStr.substr(4,2) + '/' + dateStr.substr(6,2) + ' ' +
                          dateStr.substr(8,2) + ':' + dateStr.substr(10,2) + ':' + dateStr.substr(12);
                date1 = new Date(Date.parse(dateStr));
            }else if(dateStr.length === 8){ //8位
                dateStr = dateStr.substr(0,4) + '/' + dateStr.substr(4,2) + '/' + dateStr.substr(6,2);
                date1 = new Date(Date.parse(dateStr));
            }
        }
        return date1;
    },
    /******字符串相关*****/
    /**
     * 编译字符串
     * @param str 待编译的字符串
     * @param args1,args2,args3,... 待替换的参数
     * @return 转换后的消息
     */
    compileStr:function(str){
        var reg = new RegExp(/\{.+?\}/);
        var arr = [];
        var r;
        var args = arguments;
        while((r=reg.exec(str))!==null){
            var rep;
            var sIndex = r[0].substr(1,r[0].length-2);
            var pIndex = parseInt(sIndex)+1;
            if(args[pIndex] !== undefined){
                rep = args[pIndex];
            }else{
                rep = '';
            }
            str = str.replace(reg,rep);
        }
        return str;
    },
    /**
     * json解析
     * @param jsonStr: 待解析json串
     * @return json object
     */
    parseJson:function(jsonStr){
        jsonStr = jsonStr.trim();
        var arr = jsonStr.substr(1,jsonStr.length-2).split(',');
        var repStr = "$$DD_rep_str";
        
        var obj = {};
        var reg1 = new RegExp(/\'/g);
        var reg2 = new RegExp(/\"/g);
        
        arr.forEach(function(item){
            var a = item.split(':');
            if(a[0] !== '"' && a[0] !== "'" || a[a.length-1] !== '"' && a[a.length-1] !== "'"){
                var key = a[0].replace(reg1,'\\\'');
                var v = a[1];
                var l = v.length;
                //去掉两端引号
                if(l>2 && (v[0] === '"' && v[l-1] === '"' || v[0] === '"' && v[l-1] === '"')){
                    v = v.substr(1,l-2);
                }
                obj[key] = v;
            }
        });  
        return obj;
    },
    /**********ajax相关************/
    /**
     * 加载css文件
     * @param path  css 路径
     */
    load:function(type,path,callback){
        var head = DD.get('head');
        if(head === null){
            head = document.body;
        }
        
        switch(type){
            case 'css':
                var cs = DD.get("link[href='" + path + "']");
                if(cs !== null){
                    return;
                }
                var css = DD.newEl('link');
                css.type = 'text/css';
                css.rel = 'stylesheet'; 
                // 保留script标签的path属性
                css.href = path;
                head.appendChild(css);
                if(DD.isFunction(callback)){
                    callback();
                }
                break;
            case 'js':
                // 不重复加载
                var cs = DD.get("script[src='" + path + "']");
                if(cs !== null){
                    return;
                }

                DD.request({
                    url:path,
                    type:'js',
                    successFunc:function(r){
                        var script = DD.newEl('script');
                        script.innerHTML = r;
                        head.appendChild(script);
                        script.innerHTML = '';
                        // 保留script标签的path属性
                        script.src = path;
                        if(DD.isFunction(callback)){
                            callback();
                        }
                    }
                });
                break;
        }
    },
    /**
     * 请求
     * @param config
     *          url:         请求url,
     *          reqType:     请求类型 GET、POST
     *          type:        返回类型 json、js、text，默认text
     *          async:       是否异步，默认true
     *          mime:        mime 类型
     *          params:      提交参数
     *          successFunc: 成功函数
     *          errorFunc:   失败函数
     *          timeoutFunc: 超时函数
     *          timeout:     超时时间(毫秒)
     *          user:        用户名（跨域是使用）
     *          pwd:         密码 （跨域是使用）
     * callback 传递参数 ERR-1 服务器无响应 ERR-2 超时无响应  ERR-3 服务器响应错误  其它:正常返回
     */
    
    request:function(config){
        var req = new XMLHttpRequest();
        if(DD.isEmpty(config.url)){
            throw DD.Error.handle('invoke','DD.request',"config.url",'string');
        }
        if(config.params && !DD.isObject(config.params)){
            throw DD.Error.handle('invoke','DD.request',"config.params",'object');
        }
        var async = config.async===false?false:true;
        
        //设置mime
        var mime = config.type || 'text';
        /*switch(mime){
            case 'html':
                req.overrideMimeType('text/html;charset=utf-8');
                break;
            case 'json':
                req.overrideMimeType('text/javascript;charset=utf-8');
                break;
            case 'js':
                req.overrideMimeType('text/javascript;charset=utf-8');
                break;
            case 'xml':
                req.overrideMimeType('text/xml;charset=utf-8');
                break;
            default:
                req.overrideMimeType('text/plain;charset=utf-8');
        }*/

        /**
         * 回调函数处理
         */
        //成功函数
        if(typeof config.successFunc === 'function'){
            req.onload = function(e){
                switch(req.status){
                    case 200:
                        var r = req.responseText;
                        switch(config.type){
                            case 'json':
                                r = JSON.parse(r);
                                break;
                        }
                        config.successFunc.call(req,r);
                        break; 
                    default:    //服务器异常
                        if(DD.isFunction(config.errorFunc)){
                            config.errorFunc.call(req,req.status);
                        }                
                }
                
            }
        }

        //异常函数
        if(DD.isFunction(config.errorFunc)){
            req.onerror = config.errorFunc;
        }

        //超时函数
        if(DD.isFunction(config.timeoutFunc)){
            req.ontimeout = config.timeoutFunc;
        }

        var reqType = config.reqType||'GET';
        var url = config.url;

        //发送请求
        switch(reqType){
            case 'GET':
                //参数
                var pa;
        
                if(DD.isObject(config.params)){
                    var ar = [];
                    DD.getOwnProps(config.params).forEach(function(key){
                        ar.push(key + '=' + config.params[key]);
                    });
                    pa = ar.join('&');
                }
                if(pa !== undefined){
                    if(url.indexOf('?') !== -1){
                        url += '&' + pa;
                    }else{
                        url += '?' + pa;
                    }
                }
                req.open(reqType,url,async,config.user,config.pwd);
                req.timeout = config.timeout || 0;
                req.send(null);
                break;
            case 'POST':
                var fd = new FormData();
                for(var o in config.params){
                    fd.append(o,config.params[o]);
                }
                req.open(reqType,url,async,config.user,config.pwd);
                req.timeout = config.timeout || 0;
                req.send(fd);
                break;
        }
    }

}
