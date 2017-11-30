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

/**
 * 系统配置
 * 1.配置app路径
 * 2.配置app view  路径
 * 3.配置app model 路径
 * 4.配置app viewmodel 路径
 */

DD.config = {
	renderTick:50,			//渲染时间间隔
    appPath:'',				//应用加载默认路径,
    deviceType:'ontouchend' in document?1:2		    //设备类型  1:触屏，2:pc	
};


/**
 * @description 事件类
 * @author      yanglei
 * @since       1.0
 */
 /**
  * 事件分为自有事件和代理事件
  * 自有事件绑定在view上
  * 代理事件绑定在父view上，存储于事件对象的events数组中
  * 如果所绑定对象已存在该事件名对应的事件，如果是代理事件，则添加到子事件队列，否则替换view自有事件
  * 事件执行顺序，先执行代理事件，再执行自有事件
  */
(function(){
    /**
     *  @param config   配置参数
     *          view        作用的element
     *          event       事件名 
     *          handler     事件处理函数
     *          delg        绑定到父view，事件代理，默认false 
     *          nopopo      禁止事件冒泡，默认false
     *          capture     事件在捕获或冒泡时触发，默认冒泡时
     */
    var Event = function(config){
        var me = this;
        me.events = [];                                 //子(代理)事件集合
        me.view = config.view;                          //视图
        me.handler = config.handler;                    //事件处理函数
        me.eventName = config.eventName;                //事件名
        me.delg = config.delg || false;                 //是否父对象代理
        me.nopopo = config.nopopo || false;             //是否允许冒泡
        me.once = config.once || false;                 //只执行1次
        me.capture = config.capture || false;           //useCapture参数
        //click事件根据设备类型进行处理
        if(me.eventName === 'click' && DD.config.deviceType === 1){
            me.eventName = 'tap';
        }
        if(me.delg){        //事件代理
            me.delegate();
        }else{
            me.bind();
        }
    }

    Event.prototype.fire = function(e){
        var me = this;
        if(me.view === undefined){
            return;
        }
        
        //如果capture为true，则先执行自有事件，再执行代理事件，否则反之
        if(me.capture){
            handleSelf();
            handleDelg();
        }else{
            if(handleDelg()){
                handleSelf();    
            }
        }

        //判断是否清除事件
        if(me.events.length === 0 && me.handler === undefined){
            if(DD.Event.TouchEvents[me.eventName]){
                DD.Event.unregist(me);
            }else{
                me.view.removeEventListener(me.eventName,me.handleEvent);    
            }
        }

        /**
         * 处理代理事件
         * @return true/false 是否允许冒泡，如果为false，则不执行父事件
         */
        function handleDelg(){
            //代理事件执行
            for(var i=0;i<me.events.length;i++){
                var eobj = me.events[i];
                if(eobj.view.contains(e.target)){
                    //禁止冒泡
                    if(eobj.nopopo){
                        e.stopPropagation();
                    }
                    eobj.handler.call(me.view.$module.model,e,eobj.view.$getData().data,eobj.view);
                    //只执行一次，从父事件队列中删除
                    if(eobj.once){
                        me.events.splice(i--,1);
                    }
                    if(eobj.nopopo){
                        return false;
                    }
                    break;
                }
            }
            return true;
        }

        /**
         * 处理自有事件
         */
        function handleSelf(){
            //自有事件
            if(DD.isFunction(me.handler)){
                //禁止冒泡
                if(me.nopopo){
                    e.stopPropagation();
                }
                me.handler.call(me.view.$module.model,e,me.view.$getData().data,me.view);
                //事件只执行一次，则删除handler
                if(me.once){  
                    delete me.handler;
                }
            }
        }    
    }
        
    /**
     * 绑定事件
     * @param view      绑定的view,可不传
     * @param eventName 事件名
     */
    Event.prototype.bind=function(view){
        var me = this;
        // 如果视图已绑定同名事件，则不再绑定
        if(me.view.$events[me.eventName]){
            return;
        }
        //触屏事件
        if(DD.Event.TouchEvents[me.eventName]){
            DD.Event.regist(me);
        }else{
            me.handleEvent = function(e){
                me.fire(e);
            }
            me.view.addEventListener(me.eventName,me.handleEvent);
        }
        //存储到view的$events对象
        me.view.$events[me.eventName] = me;
    }

    /**
     * 绑定事件
     * @param view      绑定的view,可不传
     * @param eventName 事件名
     */
    Event.prototype.unbind=function(view){
        var me = this;
        
        //触屏事件
        if(DD.Event.TouchEvents[me.eventName]){
            DD.Event.unregist(me);
        }else{
            //不是代理事件
            if(!me.parent){
                me.view.removeEventListener(me.eventName,me.handleEvent);
            }else{  //代理事件
                var ind = me.parent.events.indexOf(me);
                if(ind !== -1){  //从父事件集合移除
                    me.parent.events.splice(ind);
                }
            }
            
        }
    }

    /**
     * 
     * 代理事件
     *      events: {eobj:ev,handler:handler},eobj:事件对象，handler:事件方法
     * @param ev    需代理的事件
     */
    Event.prototype.delegate=function(ev){
        var me = this;
        //如果父view不存在此命名事件，则新建一个事件
        var pview = me.view.parentNode;
        //如果不存在父对象，则用body
        if(!pview){
            pview = document.body;
        }
        var pev;
        //父element 事件如果没有这个事件，则新建，否则直接指向父对象相应事件
        if(!pview.$events[me.eventName]){
            pev = new Event({
                eventName:me.eventName,
                view:pview
            });
            pev.bind();
        }else{
            pev = pview.$events[me.eventName];
        } 
        
        //如果该事件不存在该子事件，则添加子事件集合
        if(pev.events.indexOf(me) === -1){
            pev.events.push(me);
        }
    }

    DD.Event = Event;

    /**
     * 触屏事件
     */

    DD.Event.TouchEvents = {
        tap:{
            touchstart:function(e,evtObj){
                var tch = e.touches[0];
                evtObj.extParams={
                    pos : {sx:tch.pageX,sy:tch.pageY,t:Date.now()}
                }
            },
            touchmove:function(e,evtObj){
                var pos = evtObj.extParams.pos;
                var tch = e.touches[0];
                var dx = tch.pageX - pos.sx;
                var dy = tch.pageY - pos.sy;
                //判断是否移动
                if(Math.abs(dx) > 5 || Math.abs(dy) > 5){
                    pos.move = true;  
                }
            },
            touchend:function(e,evtObj){
                var pos = evtObj.extParams.pos;
                var dt = Date.now() - pos.t;
                //点下时间不超过150ms
                if(pos.move === true || dt > 300){
                    return;
                }
                evtObj.fire(e);
            }
        },
        swipe:{
            touchstart:function(e,evtObj){
                var tch = e.touches[0];
                var t = Date.now();
                evtObj.extParams={
                    swipe:{
                        oldTime:[t,t],
                        speedLoc:[{x:tch.pageX,y:tch.pageY},{x:tch.pageX,y:tch.pageY}],
                        oldLoc:{x:tch.pageX,y:tch.pageY}
                    }
                }
            },
            touchmove:function(e,evtObj){
                var nt = Date.now();
                var tch = e.touches[0];
                var mv = evtObj.extParams['swipe'];
                //50ms记录一次
                if(nt-mv.oldTime > 50){
                    mv.speedLoc[0] = {x:mv.speedLoc[1].x,y:mv.speedLoc[1].y};
                    mv.speedLoc[1] = {x:tch.pageX, y:tch.pageY};
                    mv.oldTime[0] = mv.oldTime[1];
                    mv.oldTime[1] = nt;
                }
                mv.oldLoc={x:tch.pageX,y:tch.pageY};
            },
            touchend:function(e,evtObj){
                var mv = evtObj.extParams['swipe'];
                var nt = Date.now();
                //取值序号 0 或 1，默认1，如果释放时间与上次事件太短，则取0
                var ind=(nt-mv.oldTime[1]<30)?0:1;
                var dx = mv.oldLoc.x - mv.speedLoc[ind].x;
                var dy = mv.oldLoc.y - mv.speedLoc[ind].y;
                var s = Math.sqrt(dx*dx + dy*dy);
                var dt = nt - mv.oldTime[ind];
                var v0 = s/dt;

                //速度>0.1,触发swipe事件
                if(v0 > 0.05){
                    var sname = '';
                    if(dx<0 && Math.abs(dy/dx)<1){
                        e.v0 = v0;   //添加附加参数到e
                        sname = 'swipeleft';
                    }
                    if(dx>0 && Math.abs(dy/dx)<1){
                        e.v0 = v0;
                        sname = 'swiperight';
                    }
                    if(dy>0 && Math.abs(dx/dy)<1){
                        e.v0 = v0;
                        sname = 'swipedown';
                    }
                    if(dy<0 && Math.abs(dx/dy)<1){
                        e.v0 = v0;
                        sname = 'swipeup';
                    }
                    if(evtObj.eventName === sname){
                        evtObj.fire(e);
                    }
                }
            }
        }
    }
    DD.Event.TouchEvents['swipeleft'] = DD.Event.TouchEvents['swipe'];
    DD.Event.TouchEvents['swiperight'] = DD.Event.TouchEvents['swipe'];
    DD.Event.TouchEvents['swipeup'] = DD.Event.TouchEvents['swipe'];
    DD.Event.TouchEvents['swipedown'] = DD.Event.TouchEvents['swipe'];
    /**
     * 注册事件
     * @param evtObj    event对象
     */
    DD.Event.regist = function(evtObj){
        var evt = DD.Event.TouchEvents[evtObj.eventName];
        //如果绑定了，需要解绑
        if(!DD.isEmpty(evtObj.touchListeners)){
            DD.Event.unregist(evtObj);
        }
        evtObj.touchListeners = {};
        if(evt){
            // 绑定事件
            DD.getOwnProps(evt).forEach(function(ev){
                //先记录下事件，为之后释放
                evtObj.touchListeners[ev] = function(e){
                    evt[ev](e,evtObj);
                }
                //绑定事件
                evtObj.view.addEventListener(ev,evtObj.touchListeners[ev]);
            });
        }
    }

    /**
     * 取消已注册事件
     * @param evtObj    event对象
     */
    DD.Event.unregist = function(evtObj){
        var evt = DD.Event.TouchEvents[evtObj.eventName];
        if(evt){
            // 解绑事件
            DD.getOwnProps(evtObj.touchListeners).forEach(function(ev){
                evtObj.view.removeEventListener(ev,evtObj.touchListeners[ev]);
            });
        }  
    }

    
}());    
'use strict';

/**
 * 表达式
 * @author  yanglei
 * @since   1.0.0
 */

 /**
  * 表达式说明
  * 1 表达式数据类型包括字段、数字、字符串、函数
  * 2 运算符包括 '(',')','*','/','|','+','-','>','<','>=','<=','==','===','&&','||'，其中'|' 表示过滤器
  * 3 函数参数类型包括 字段、数字、字符串，所有参数不能含有过滤器
  * 4 表达式优先级仅低于(),如果表达式前需要计算，需要样式如 (x*y)|currency:$
  */

(function(){
    DD.Expression = {
        /**
         * 表达式数组计算
         * @param module    模块
         * @param exprArr   表达式数组
         * @param model     model.$model
         * @return          处理结果
         */
        handle : function(module,exprArr,model){
            var me = this;
                    
            if(!DD.isArray(exprArr)){
                return;
            }
            var isChange = false;
            var len = exprArr.length;
            var result = '';
            exprArr.forEach(function(item){
                if(item.type === 'string'){
                    result += item.src;
                }else{
                    var r = me.cacExpr(module,item.src,model);
                    if(!isChange && r[0]){
                        isChange = true;
                    }
                    result += r[1];    
                }
            });
            return [isChange,result];
        },

        /**
         * 初始化处理表达式串，表达式字符串中出现一个或多个{{}}
         * @param exprStr   表达式字符串
         * @return          处理结果[{type:类型，src:处理结果},...]
         */
        initExpr : function(exprStr){
            var me = this;
            var reg = new RegExp(/\{\{.+?\}\}/g);
            var indexes = [];//save reg string loc
            var result = [];
            var ind = 0;
            var r;
            while((r = reg.exec(exprStr)) !== null){
                if(r.index>ind){
                    var s = exprStr.substring(ind,r.index);
                    if(!DD.isEmpty(s)){
                        result.push({
                            type:'string',
                            src:s
                        });    
                    }
                    
                }
                result.push({
                    type:'expr',
                    src:me.initOne(r[0].substring(2,r[0].length-2))
                });
                //更改下一个表达式的对比起点
                ind = r.index + r[0].length;
            }
            //最后一个字符串
            if(ind < exprStr.length){
                var s = exprStr.substr(ind);
                if(!DD.isEmpty(s)){
                    result.push({
                        type:'string',
                        src:s
                    });    
                }
            }
            //固定值不需要渲染
            if(result.length === 1 && result[0].src[0].length === 1){
                var type = result[0].src[0][0].type;
                if(type === 'string' || type === 'number' || type === 'bool' || type === 'blank'){
                    return result[0].src[0][0].src;
                } 
            }
            return result;
        },

        /**
         * 初始化单个表达式
         * @param exprStr    表达式串
         * @return          堆栈数组:0 计算源  1运算符
         */
        initOne : function(exprStr){
            //运算符
            var cacSign = ['(',')','!','|','*','/','+','-','>','<','>=','<=','==','===','&&','||','%'];
            
            //函数匹配正则式
            var regFun = new RegExp(/[\w$][\w$\d\.]*\(.*?\)/);
            //字符串正则式
            var regStr = new RegExp(/(\'.+?\')|(\".+?\")/);

            //函数替换串前缀
            var funPrev = '$DDfun_rep_';
            //字符串替换串前缀
            var strPrev = '$DDstr_rep_';
            //函数替换数组
            var funArr = [];
            //字符串替换数组
            var strArr = [];
            //替换起始索引
            var repIndex = 0;
            var r;
            
           
            //1 替换字符串
            while((r=regStr.exec(exprStr)) !== null){
                //串替换
                exprStr = exprStr.replace(r[0],(strPrev + repIndex++));
                strArr.push(r[0]);
            }

            //2 替换函数 如：foo(a,b,...)  Math.round(a) 等
            repIndex = 0;
            while((r=regFun.exec(exprStr)) !== null){
                //串替换
                exprStr = exprStr.replace(r[0],(funPrev + repIndex++));
                funArr.push(r[0]);
            }

            //构建表达式堆栈
            var stacks = genStack(exprStr);
            var stack1 = [];    //最终的运算结果堆栈
            
            //还原运算字段构建
            stacks[0].forEach(function(item,ii){
                //还原函数
                for(var i=0;i<funArr.length;i++){
                    if(item.indexOf(funPrev + i) !== -1){
                        var ind1 = funArr[i].indexOf('(');
                        var fn = funArr[i].substr(0,ind1).trim();
                        var pm = getParams(funArr[i]);
                        stack1.push({
                            type:'function',    //函数
                            fn: fn,             //函数名
                            params:pm           //参数数组
                        });
                        return;
                    }
                }

                //还原字符串
                for(var i=0;i<strArr.length;i++){
                    if(item.indexOf(strPrev + i ) !== -1){
                        stack1.push({
                            type:'string',                          //字符串
                            src:item.replace(strPrev+i,strArr[i])   //源
                        });
                        return;
                    }   
                }
                
                if(item === ""){
                    stack1.push({
                        type:'blank',       //空串
                        src:item            //源
                    });
                }else if(!isNaN(item)){
                    stack1.push({
                        type:'number',      //数字
                        src:eval(item)      //源
                    });
                }else{
                    if(item === "true" || item === "false"){
                        stack1.push({   
                            type:'bool',
                            src:eval(item)
                        });
                    }else{
                        stack1.push({
                            type:'field',       //字段
                            src:item.trim()     //源
                        });    
                    }
                }
            });

            stacks[0] = stack1;
            
            //处理过滤器
            initFilter();
            //返回堆栈数组 0: 计算源数组  2运算符数组
            return stacks;

            /**
             * 表达式堆栈构建
             * @param s 待分解的字符串
             * @return 表达式 和 操作符堆栈
             */
            function genStack(s){
                var stack1=[],stack2=[];
                var index1 = 0;
                for(var ii=0;ii<s.length;ii++){
                    //按照优先级倒序查找操作符
                    for(var i=cacSign.length-1;i>=0;i--){
                        var len = cacSign[i].length;
                        if(s.substr(ii,len) === cacSign[i]){
                            stack1.push(s.substr(index1,ii-index1).trim());
                            // stack1.push(s.substr(index1,ii-index1));
                            stack2.push(cacSign[i]);
                            ii += len-1;        
                            index1 = ii+1;      //重新定位下次开始位置
                            break;
                        }
                    }
                }
                //最后一个
                if(index1 < s.length){
                    stack1.push(s.substr(index1));
                }
                return[stack1,stack2];
            }

            /**
             * 获取函数参数
             * @param funStr    函数串(带参数)
             * @return  参数数组{type:'string'.src:**} {type:'number',src:**} {type:'feild',src:**}
             */
            function getParams(funStr){
                var params = [];
                var pas = funStr.substring(funStr.indexOf('(')+1,funStr.lastIndexOf(')'));
                if(pas !== '' && (pas=pas.trim())!==''){
                    //参数分隔
                    var pa = pas.split(',');
                    //参数还原
                    pa.forEach(function(p){
                        p = p.trim();
                        //还原字符串
                        for(var i=0;i<strArr.length;i++){
                            if(strPrev + i === p){
                                params.push({
                                    type:'string',
                                    src:strArr[i]
                                });
                                return;
                            } 
                        }
                        var pm;
                        //数字
                        if(!isNaN(p)){
                            pm = {
                                type:'number',
                                src:p
                            }
                        }else{  //字段
                            pm = {
                                type:'field',
                                src:p.trim()
                            }
                        }
                        params.push(pm);
                    });
                }
                return params;
            }

            /**
             * 初始化过滤器
             */
            function initFilter(){
                for(var i=0;i<stacks[1].length;i++){
                    //回溯过滤器前符号
                    if(stacks[1][i] === '|'){
                        var pa = {
                            type:'filter',
                            //存储相邻两个计算域
                            exprs:[stacks[0][i],stacks[0][i+1]],
                            signs:[]
                        };
                        var backIndex = i;
                        var sign = stacks[1][i-1];
                        var theCnt = 0;  //括号数量
                        if(sign === ')'){
                            theCnt++;
                            //替换括号前的空串并删除计算源i
                            pa.exprs[0] = stacks[0][i-1]; 
                            stacks[0].splice(i);
                            for(var j=i-2;j>=0;j--){
                                if(stacks[1][j] === ')'){
                                    theCnt++;
                                }else if(stacks[1][j] === '('){
                                    if(--theCnt===0){
                                        backIndex = j;
                                        break;    
                                    }
                                }
                            }

                            pa.signs.unshift(sign);
                            // 处理表达式运算符和运算源
                            for(var j=i-2;j>=backIndex;j--){
                                pa.exprs.unshift(stacks[0][j]);
                                pa.signs.unshift(stacks[1][j]);
                            }
                        }
                        //改变计算源数组
                        stacks[0].splice(backIndex,i-backIndex+2,pa);
                        //删除计算符数组元素
                        stacks[1].splice(backIndex,i-backIndex+1);
                        //修改索引
                        i=backIndex;
                    }
                }
            }
        },

        /**
         * 计算表达式
         * @param module 模块
         * @param stacks 计算堆栈数组
         * @param model  模型数据
         * @return 计算结果
         */
        cacExpr : function(module,stacks,model){
            var expr = "";
            //是否存在运算符
            var hasCac = false;
            for(var i=0;i<stacks[1].length;i++){
                if(stacks[1][i] !== ''){
                    hasCac=true;
                    break;
                }
            }
            var isChange = false;
            stacks[0].forEach(function(item,ii){
                var r = cacOne(item);
                if(!isChange && r[0]){
                    isChange = true;
                }
                var v = r[1];
                var sign = ''; 
                //添加运算符
                if(ii<stacks[1].length){
                    sign = stacks[1][ii];    
                }
                expr += v + sign;
            });
            //带有运算符，需要进行计算
            if(hasCac){
                try{
                    if(expr !== ''){
                        expr = eval(expr);    
                    }
                }catch(e){
                }
            }

            return [isChange,expr];

            /**
             *  调用函数对象
             */
            function invoke(funObj){
                var foo;
                var isSystem = false;
                if(funObj.fn.indexOf('.') === -1){  //不带点，则绑定为模块方法
                    foo = module.methodFactory.get(funObj.fn);
                    if(foo === undefined){
                        throw DD.Error.handle('notexist1',DD.words.module+DD.words.method,funObj.fn);
                    }
                }else{
                    //得到js内置函数
                    isSystem = true;
                    foo = eval(funObj.fn);
                }

                //参数构建
                var pa = [];
                var change = false;
                funObj.params.forEach(function(p){
                    switch(p.type){
                        case 'field':
                            var v = getValue(module,p.src,model);
                            //判断value是否有修改
                            if(v[0]){
                                change = true;
                            }
                            v = v[1];
                            if(v === undefined || v === null){
                                throw DD.Error.handle('notexist1',DD.words.dataItem,p.src);
                            }
                            pa.push(v);
                            break;
                        case 'number':
                            pa.push(eval(p.src));
                            break;
                        default:
                            pa.push(p.src);
                    }
                });

                //函数调用
                if(isSystem){
                    return [change,foo.apply(null,pa)];
                }else{
                    return [change,foo.apply(module.model,pa)];
                }
            }

            /*
             * 处理过滤器
             * @param filterObj 过滤器对象
             * @return  过滤器计算结果
             */
            function filter(filterObj){
                var exprs = filterObj.exprs;
                var signs = filterObj.signs;
                var src;
                var r = '';
                var change = false;
                for(var i=0;i<exprs.length-1;i++){
                    var r1 = cacOne(exprs[i]);
                    //设置是否有字段修改
                    if(r1[0]){
                        change = true;
                    }
                    //把值加到字符串
                    r += r1[1];
                    if(i<signs.length){
                        r += signs[i];
                    }
                }
                if(signs.length>0){
                    try{
                        r = eval(r);
                    }catch(e){

                    }
                }
                //返回过滤器处理结果
                return [change,DD.Filter.handle(module,r,exprs[i].src)];
            }

            /**
             * 获取一个计算源结果
             * @param item  计算源对象
             * @return      返回结果
             */
            function cacOne(item){
                var change = false;
                switch(item.type){
                    case 'field':
                        var v = getValue(module,item.src,model);
                        return [v[0],addQuot(v[1])];
                    case 'function':
                        var v = invoke(item);
                        return [v[0],addQuot(v[1])];
                    case 'filter':
                        var v = filter(item);
                        return [v[0],addQuot(v[1])];
                    default:
                        return [false,item.src];
                }

                //添加引号
                function addQuot(v){
                    //只取值
                    if(!hasCac){
                        return v;
                    }
                    if(v === undefined || v === true || v === false || v === null){
                        return v;
                    }
                    //如果是字符串，同时需要进行运算,需要给字符串加上 引号
                    if(DD.isString(v)){
                        var ind = v.indexOf("'");
                        if(ind !== -1){
                            if(ind > 0){
                                v = '"' + v + '"';    
                            }
                        }else if((ind=v.indexOf('"')) > 0 || ind === -1){
                            v = "'" + v + "'";
                        }
                    }
                    return v;
                }
            }

            /**
             * 获取字段值
             * @param module 模块
             * @param fn    字段
             * @param model view.$model
             */
            function getValue(module,fn,model){
                var m = model.data;
                if(m === null || m === undefined){
                    return[false,''];
                }
                
                //索引号
                if(fn === '$index'){
                    return [model.oldIndex !== model.index,model.index];
                }
                
                //为model才处理字段
                if(DD.isFunction(m.$get)){
                    var v = m.$get(fn);
                    if(v[1] !== undefined){    
                        return v;
                    }
                }
                //如果没找到，则返回''
                return [false,''];
            }
        }
    }
}());


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
         * @param model model
         */
        handle : function(view,model){
            var me = this;
            var el = view;
            var removeArr = [];
            view.$directives.forEach(function(item){
                var dname = item.name;
                var d = me.directives[dname];
                if(d !== undefined && DD.isFunction(d.handler)){
                    d.handler.call(view,item,model);
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
    function domodel(directive,model){
        var view = this;
        if(!model){
            //清掉之前的数据
            view.$model.data = null;
            view.$model = view.$getData();    
        }
    }

    /**
     * repeat 指令
     * @param directive 指令
     */
    function dorepeat(directive,model){
        var view = this;
        
        if(DD.isEmpty(directive)){
            directive = view.$getDirective('repeat');
        }
        if(!model){
            model = view.$getData();
        }

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
    function doif(directive,model){
        var view = this;
        if(DD.isEmpty(directive)){
            directive = view.$getDirective('if');
        }
        if(!model){
            model = view.$getData();
        }
        //设置forceRender
        var fr = view.$forceRender || view.$module.forceRender;
        if(DD.isArray(directive.value)){
            var re = DD.Expression.handle(view.$module,directive.value,model);
            //无修改，不执行
            if(!re[0] && !fr){
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
    function doclass(directive,model){
        var view = this;
        //只针对element处理
        if(view.nodeType !== Node.ELEMENT_NODE){
            return;
        }
        if(DD.isEmpty(directive)){
            directive = view.$getDirective('class');
        }
        var obj = directive.value;
        if(!model){
            model = view.$getData();
        }
        //forceRender
        var fr = view.$forceRender || view.$module.forceRender;
        DD.getOwnProps(obj).forEach(function(key){
            var r = obj[key];
            if(DD.isArray(obj[key])){
                var re = DD.Expression.handle(view.$module,obj[key],model);
                if(!re[0] && !fr){
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
    function doshow(directive,model){
        var view = this;
        
        if(DD.isEmpty(directive)){
            directive = view.$getDirective('show');
        }
        if(!model){
            model = view.$getData();
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
                view.$setForceRender(true);
            }else{
                DD.css(view,'display','none');    
            }
        }
        
        function render(){
            //执行表达式对象
            var r = true;
            if(DD.isArray(directive.value)){
                var re = DD.Expression.handle(view.$module,directive.value,model);
                if(!re[0] && !view.$forceRender && !view.$module.forceRender){
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
    function dofield(directive,model){
        var view = this;
        var tp = view.type;
        var tgname = view.tagName.toLowerCase();
        if(tp !== 'radio' && tp !== 'checkbox' && tgname !== 'select'){
            return;
        }
            
        if(!model){
            model = view.$getData();
        }
        
        var fr = view.$forceRender || view.$module.forceRender;
        var re = model.data.$get(directive.value);
        //对应字段无修改，则不执行
        if(!re[0] && !fr){
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

/**
 * 过滤器
 * @author yanglei
 * @since 1.0
 */

(function(){
    DD.Filter = {
        //不可修改的过滤器列表
        cantEditFilters : ['date','currency','number','tolowercase','touppercase','orderBy','filter'],
        //过滤器对象
        filters : {
            /**
             * 格式化日期
             * @param format    日期格式
             */
            date : function(value,param){
                if(DD.isEmpty(value)){
                    throw DD.Error.handle('invoke','filter date',0,'string');
                }
                if(!DD.isArray(param)){
                    throw DD.Error.handle('paramException',DD.words.filter,'date');
                }
                var format = param[0];
                //去掉首尾" '
                format = format.substr(1,format.length-2);
                return DD.formatDate(value,format);
            },
            /**
             * 转换为货币
             * @param sign  货币符号¥ $ 等，默认 ¥
             */
            currency : function(value,param){
                var sign;
                if(DD.isArray(param)){
                    sign = param[0];
                }
                if(isNaN(value)){
                    throw DD.Error.handle('paramException',DD.words.filter,'currency');
                }
                if(typeof value === 'string'){
                    value = parseFloat(value);
                }
                if(DD.isEmpty(sign)){
                    sign = '¥';
                }
                return sign + DD.Filter.filters.number(value,[2]);
            },
            /**
             * 格式化，如果为字符串，转换成数字，保留小数点后位数
             * @param digits    小数点后位数
             */
            number : function(value,param){
                if(!DD.isArray(param)){
                    throw DD.Error.handle('paramException',DD.words.filter,'number');
                }
                var digits = param[0]||0;
                if(isNaN(value) || digits < 0){
                    throw DD.Error.handle('paramException',DD.words.filter,'number');
                }
                if(typeof value === 'string'){
                    value = parseFloat(value);
                }
                //js tofixed有bug，这儿多处理一次
                var x = 1;
                for(var i=0;i<digits;i++){
                    x*=10;
                }
                return (((value*x+0.5)|0)/x).toFixed(digits);
            },
            /**
             * 转换为小写字母
             */
            tolowercase : function(value){
                if(!DD.isString(value) || DD.isEmpty(value)){
                    throw DD.Error.handle('invoke1',DD.words.filter + ' tolowercase',0,'string');
                }
                return value.toLowerCase();
            },

            /**
             * 转换为大写字母
             * @param value
             */
            touppercase : function(value){
                if(!DD.isString(value) || DD.isEmpty(value)){
                    throw DD.Error.handle('invoke1',DD.words.filter + ' touppercase',0,'string');
                }
                return value.toUpperCase();
            },

            /**
             * 数组排序
             * @param arr       数组
             * @param param     
             *     用法: orderBy:字段:desc/asc
             */
            orderBy : function(arr,param){
                if(!DD.isArray(param)){
                    throw DD.Error.handle('invoke1',DD.words.filter + ' orderBy',0,'array');
                }
                var p = param[0];                  //字段
                var odr = param[1] || 'asc';    //升序或降序,默认升序
                //复制数组
                var ret = arr.concat([]);
                ret.sort(function(a,b){
                    if(odr === 'asc'){
                        return a[p] > b[p];    
                    }else{
                        return a[p] < b[p];
                    }
                });
                return ret;
            },
            /**
             * 数组过滤
             * 用法: 无参数filter:odd,带参数 filter:range:1:5
             * odd      奇数
             * even     偶数
             * v:       值中含有v字符的
             * {prop:v} 属性prop的值中含有v字符的
             * func     自定义函数过滤
             * range    数组范围
             * index    数组索引序列
             *
             * @param   array       待过滤数组
             * @param   paramStr    参数串 如 range:1:5，参数之间以“:”分隔
             */
            select : function(array,pa){
                var me = this;
                if(!DD.isArray(array)){
                    throw DD.Error.handle('invoke1',DD.words.filter + ' filter',0,'array');
                }

                if(DD.isEmpty(pa)){
                    throw DD.Error.handle('invoke3',DD.words.filter + ' filter',0,'array');
                }
                //方法对象
                var handler = {
                    odd:function(arr){
                        var ret = [];
                        for(var i=0;i<arr.length;i++){
                            if(i%2 === 1){
                                ret.push(arr[i]);
                            }
                        }
                        return ret;
                    },
                    even:function(arr){
                        var ret = [];
                        for(var i=0;i<arr.length;i++){
                            if(i%2 === 0){
                                ret.push(arr[i]);
                            }
                        }
                        return ret;
                    },
                    range:function(arr,pa){
                        var ret = [];
                        //第一个索引,第二个索引
                        var first,last;
                        if(isNaN(pa[0])){
                            throw DD.Error.handle('paramException',DD.words.filter , 'filter range');
                        }
                        first = parseInt(pa[0]);

                        if(isNaN(pa[1])){
                            throw DD.Error.handle('paramException',DD.words.filter , 'filter range');
                        }
                        last = parseInt(pa[1]);
                        
                        if(first > last){
                            throw DD.Error.handle('paramException',DD.words.filter , 'filter range');   
                        }
                        
                        return arr.slice(first,last+1);
                    },
                    index:function(arr,pa){
                        if(!DD.isArray(arr) || !DD.isArray(pa)){
                            throw DD.Error.handle('paramException',DD.words.filter,'filter index');
                        }
                        var ret = [];
                        var len = arr.length;
                        if(pa.length>0){
                            pa.forEach(function(k){
                                if(isNaN(k)){
                                    return;
                                }
                                parseInt(k);
                                if(k>=0 && k<len){
                                    ret.push(arr[k]);
                                }
                            });
                        }
                        return ret;
                    },
                    func:function(arr,param){
                        if(!DD.isArray(arr) || DD.isEmpty(param)){
                            throw DD.Error.handle('paramException',DD.words.filter,'filter func');   
                        }
                        
                        var foo = me.methodFactory.get(param[0]);
                        if(DD.isFunction(foo)){
                            return foo(arr);    
                        }
                        return arr;
                    },
                    value:function(arr,param){
                        if(!DD.isArray(array) || DD.isEmpty(param)){
                            throw DD.Error.handle('paramException',DD.words.filter,'filter value');   
                        }
                        var ret = [];
                        if(param[0] === '{' && param[param.length-1] === '}'){
                            param = eval('(' + param + ')');
                        }
                        //参数过滤
                        if(DD.isObject(param)){
                            var keys = DD.getOwnProps(param);
                            return arr.filter(function(item){
                                for(var i=0;i<keys.length;i++){
                                    var v =  item[keys[i]];
                                    var v1 = param[keys[i]];
                                    if(typeof v === 'string' && v.indexOf(v1) !== -1 || v === v1){
                                        return true;
                                    }
                                }
                                return false;
                            });
                        }else{
                            return arr.filter(function(item){
                                var props = DD.getOwnProps(item);
                                for(var i=0;i<props.length;i++){
                                    var v = item[props[i]];
                                    if(DD.isString(v) && v.indexOf(param) !== -1){
                                        return item;
                                    }
                                }
                            });
                        }
                    }
                }
                var type = pa[0].trim();
                //默认为value
                if(!handler.hasOwnProperty(type)){
                    type = 'value';
                }
                //校验输入参数是否为空
                if(type === 'range' || type === 'index' || type === 'func'){
                    if(pa.length < 2){
                        throw DD.Error.handle('paramException',Dd.words.filter);
                    }
                    //方法调用
                    return handler[type].call(me,array,pa.slice(1));
                }else if(type === 'value'){
                    return handler[type].call(me,array,pa[0]);
                }else{
                    return handler[type].call(me,array);
                }
            }
        },
    
        /**
         * 过滤器处理
         * @param module    模块
         * @param src       待处理源
         * @param params    过滤器参数串
         * @return          处理结果
         */
        handle : function(module,src,params){
            var me = this;
            if(DD.isEmpty(src)){
                return '';
            }
                
            if(DD.isEmpty(params)){
                return src;
            }
            /**
             * 1 处理所有的{}内容
             * 2 分多级过滤,下级过滤器使用上级过滤器结果
             * 3 单个过滤器处理
             */
            //1
            //定义替换串
            var replaceStr = '$DD_rparam_',                         //替代串
                reg = new RegExp(/(\{.+?\})|(".+?")|('.+?')/g),     //替代正则式
                replaceArr = [],                                    //替代数组
                r,
                i=0;

            while((r=reg.exec(params)) !== null){
                replaceArr.push(r[0]);
                params = params.replace(r[0], replaceStr + i++);
            }
            var farr = params.split('|');
            farr.forEach(function(param){
                if(DD.isEmpty(param.trim())){
                    return;
                }
                var pa = param.split(':');
                for(var i=0;i<pa.length;i++){
                    pa[i] = pa[i].trim();
                }
                var type = pa[0];
                
                //{}格式对象还原
                if(replaceArr.length>0){
                    for(var ii=1;ii<pa.length;ii++){
                        for(var i=0,len=replaceArr.length;i<len;i++){
                            pa[ii] = pa[ii].trim().replace(replaceStr+i,replaceArr[i]);
                        }    
                    }
                }
                if(DD.isFunction(me.filters[type])){
                    src = me.filters[type].call(module,src,pa.slice(1));
                }
            });
            return src;
        },

        /**
         * 添加过滤器
         * @param name      过滤器名
         * @param handler   过滤器方法
         */
        add : function(name,handler){
            var me = this;
            if(me.cantEditFilters.indexOf(name) !== -1){
                throw DD.error.handle('notupd',DD.words.system + DD.words.filter,name);
            }
            if(me.filters[name] !== undefined){
                throw DD.Error.handle('exist1',DD.words.filter,name);
            }
            me.filters[name] = handler;
        },

        /**
         * 移除过滤器
         * @param name  过滤器名
         */
        remove : function(name){
            var me = this;
            if(me.cantEditFilters.indexOf(name) !== -1){
                throw DD.Error.handle('notupd',DD.words.system + DD.words.filter,name);
            }
            if(me.filters[name] === undefined){
                throw DD.Error.handle('notexist1',DD.words.filter,name);
            }
            delete me.filters[name];
        }
    }
}());

(function(){
	var M = function(){
		var me = this;
		me.methods = {};
	}

	M.prototype = {
		add:function(mname,handler){
			var me = this;
			if(DD.isEmpty(mname)){
				throw DD.Error.handle('invoke','DD.MethodFactory.add',0,'string');
			} 
			if(!DD.isFunction(handler)){
				throw DD.Error.handle('invoke','DD.MethodFactory.add',0,'function');
			}
			
			if(DD.isFunction(me.methods[mname])){
				throw DD.Error.handle('exist1',DD.words.method,mname);
			}
			me.methods[mname] = handler;
		},
		remove:function(mname){
			var me = this;
			if(DD.isEmpty(mname)){
				throw DD.Error.handle('invoke','DD.MethodFactory.remove',0,'string');
			}
			if(me.methods[mname] === undefined){
				throw DD.Error.handle('notexist1',DD.words.method,mname);
			}
			delete me.methods[mname];
		},
		get:function(mname){
			return this.methods[mname];
		}
	}

	DD.MethodFactory = M;
}());
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
                return this.$changed;
            }else{
                if(this.$changed){
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
                            if(o.$changed){
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
                            if(o.$changed){
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
        me.parent = config.parent;
        
        //创建virtualDom
        me.virtualDom = DD.newEl('div');
        var pview;  //父module view
        var view;   //当前模块在父module中的view   
        //如果父模块存在
        if(me.parent){
            //如果为字符串，则需要从模块工厂获取
            if(DD.isString(me.parent)){
                var mn = me.parent;
                me.parent = DD.Module.get(mn);
                if(!me.parent){
                    throw DD.Error.handle('notexist1',DD.words.module,mn);
                }
            }
            // 加入到父模块的子模块集合
            me.parent.modules.push(me);
            
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
            
            //数据为空，则使用用空对象
            data = data || {};
            new DD.Model({data:data,module:me});
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
            //加入渲染队列
            DD.Renderer.add(me);
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
        //是否有module class存在，则需要先检查class是否存在virtualDom，如果存在，则不用再编译，否则把模块的virturalDom编译了给class
        if(me.className && (cls = DD.Module.getClass(me.className))!==undefined && cls.virtualDom){
            me.virtualDom = cls.virtualDom;
            return;
        }

        //编译
        var vd = DD.Compiler.compile(me.virtualDom,me);
        //如果存在class，则设置class的virtualDom
        if(cls){
            cls.virtualDom = vd;
        }
        me.compiled = true;
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
            return;
        }

        //父模块未渲染，不进行渲染
        if(me.parent && !me.parent.rendered){
            return;
        }
        //获取渲染容器
        getView(me);
        //view不存在，不渲染
        if(!me.view){
            return;
        }

        //设置模块view为view
        if(!me.view.$isView){
            DD.merge(me.view,DD.extendElementConfig);
            me.view.$isView = true;
        }

        //无数据不渲染
        if(me.needData && !me.model){
            return;
        }
        //设置清除upd标志
        if(me.view.childNodes.length === 0){ //没渲染过，从virtualDom渲染
            //用克隆节点操作，不影响源节点
            var cloneNode = DD.cloneNode(me.virtualDom);
            //把cloneNode下的所有节点渲染到view
            DD.Renderer.renderView(cloneNode,me);
            //把clone后的子节点复制到模块的view
            DD.transChildren(cloneNode,me.view);
            me.view.$containModule = true;  //设置view为module容器
            //触发首次渲染事件
            if(!me.rendered && DD.isFunction(me.onFirstRender)){
                me.onFirstRender.call(me.model);
            }
            
            //设置已渲染标志
            me.rendered = true;
            //首次渲染，需要渲染子模块
            me.renderChildren = true;
        }else{  //渲染过，从view渲染
            DD.Renderer.renderView(me.view,me);
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
        }
        //删除渲染子节点标志
        delete me.renderChildren;
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
        return DD.Module.create(config);
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
        create:function(config){
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
                    DD.Module.create(cfg);
                })
            }else{
                return DD.Module.create(config);
            }
        },
        defineModule:function(config){
            return DD.Module.define(config);
        }
    });
    
    DD.Module = Module;
}());

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
/**
 * 渲染器
 * @description 	维护模块渲染,把需要渲染的模块追加到渲染器的渲染列表，根据该模块所在的等级来确定优先级，
 *  				优先级以所在的子孙级确定，第一层为1，第二层为2，依次类推
 *
 * @author 			yanglei
 * @since  			1.0.0
 * @date   			2017-03-04
 */

(function(){	
	DD.Renderer = {
		waitList : [],//待渲染列表
		/**
		 * 添加到渲染列表
		 * @param module 		模块
		 */
		add:function(module){
			var me = this;
			//如果已经在列表中，不再添加
			if(me.waitList.indexOf(module) === -1){
				//计算优先级
				if(module.prio === undefined){
					var prio = 1,pm=module.parent;
					while(pm !== undefined){
						prio++;
						pm=pm.parent;
					}
				}
				module.prio=prio;
				me.waitList.push(module);
				//排序
				me.waitList.sort(function(a,b){
					return a.prio - b.prio;
				});
			}
		},
		//从列表移除
		remove:function(module){
			var ind;
			if((ind = me.waitList.indexOf(module)) !== -1){
				me.waitList.splice(ind,1);
			}
		},
		render:function(){
			var me = this;
			if(me.waitList.length === 0){
				return;
			}

			//调用队列渲染
			for(var i=0;i<me.waitList.length;i++){
				var m = me.waitList[i];
				me.waitList.splice(i--,1);
				m.render();
			}
		},
		/**
		 * 渲染view
		 * @param view 			待渲染的视图
		 * @param module 		模块
		 * @param renderData 	渲染数据
		 * @return 			true/false
		 */
		renderView:function(view,module,renderData){
			renderDom(view,true);
			function renderDom(node,isRoot){
	            //设置$module
	            if(!isRoot){
	                node.$module = module;
	            }
	            //子模块不渲染
	            if(node.$containModule && !isRoot){
	            	return;
	            }
	            if(node.$isView){
	                //未渲染，则进行事件初始化
	                if(!node.$rendered && DD.isEl(node)){
	                    initEvents(node);
	                }
	                //如果存在model指令，则需要先执行model指令以修改数据
	                if(node.$hasDirective('model')){
	                	DD.Directive.directives['model'].handler.call(node,null);
	                }
	                var model = node.$getData();
	                //如果存在renderData，则设置强制渲染
	                if(renderData){
	                	if(node.$model){
	                		node.$model.data = rendererData;
	                	}else{
	                		node.$model = {
	                			data:rendererData
	                		}
	                	}
	                	node.$setForceRender(true);
	                }
	                //数据改变，或node forceRender或module forceRender 进行渲染
	                if(model.data && model.data.$changed || node.$forceRender || module.forceRender){
	                	if(DD.isEl(node)){
	                		//指令表达式处理
	                        var directives = [];
	                        DD.getOwnProps(node.$attrs).forEach(function(attr){
	                            var r = DD.Expression.handle(module,node.$attrs[attr],model);
	                            //如果字段没修改且没有设置强制渲染，则不设置属性
	                            if(!r[0] && !node.$forceRender && !module.forceRender){
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
	                    	DD.Directive.handle(node,model);
	                    }
	                }

	                //渲染子节点
	                //隐藏节点不渲染子节点
	                var showDir = node.$getDirective('show');
	                if((!showDir || showDir.yes) && node.childNodes){
	                	for(var i=0;i<node.childNodes.length;i++){
	                        //子element或 自己的data修改后的文本子节点
	                        if(node.$isView || model.data.$changed){
	                            renderDom(node.childNodes[i]);    
	                        }
	                    }
	                }
	                //设置渲染标志
	                node.$rendered = true;
	                //删除forceRender属性
	            	delete node.$forceRender;
	            }else if(module.model && module.model.data && node.nodeType === Node.TEXT_NODE && node.$exprs){
	                var model = node.parentNode.$getData();
	                //model changed 或 forcerender 才进行渲染
	                if(model.data && model.data.$changed || node.parentNode.$forceRender || module.forceRender){
	                    var r = DD.Expression.handle(module,node.$exprs,model); 
	                    //数据未修改，forceRender为false，不渲染
	                    if(!r[0] && !node.parentNode.$forceRender && !module.forceRender){
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
	                        DD.Compiler.compile(div,module);
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
	         * 初始化事件
	         */
	        function initEvents(el){
	            var attrs = DD.getAttrs(el,/^e-/);
	            if(attrs.length>0){
	                attrs.forEach(function(attr){
	                    //处理管道
	                    var arr = attr.value.split(':');
	                    var handler = module.methodFactory.get(arr[0]);
	                    //如果不存在事件方法，则不处理，可能是子模块方法，留给子模块处理
	                    if(!handler){
	                        return;
	                    }
	                    //去掉e-前缀
	                    var ename = attr.name.substr(2);
	                    
	                    var param = {
	                        view:el,
	                        eventName:ename,
	                        handler:handler
	                    };
	                    //处理多个参数
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
	}

	//启动渲染器
	renderLoop();
	function renderLoop(){
		DD.Renderer.render();
		if(requestAnimationFrame){
		 	requestAnimationFrame(renderLoop);
		}else{
			setTimeout(renderLoop,DD.config.renderTick);
		}
	}
}());

/**
 * 编译器，负责模版的编译
 * @since 1.0
 */

(function(){
    DD.Compiler = {
        /**
         * 编译 
         * @param view      指定的view
         * @param module    模块
         * @return          view
         */
        compile:function(view,module){
            return compileEl(view);
                
            /**
             * 编译单个element
             * @param el    待编译的element
             * @return      编译后的element
             */
            function compileEl(el){
                //扩展element方法
                DD.merge(el,DD.extendElementConfig);
                // 指定模块
                el.$module = module;
                
                //处理属性表达式
                DD.getAttrsByValue(el,/\{\{.+?\}\}/).forEach(function(attr){
                    module.needData = true;
                    // 保存带表达式的属性
                    el.$attrs[attr.name]=DD.Expression.initExpr(attr.value,el);
                    //移除属性
                    el.removeAttribute(attr.name);
                });
                
                //初始化指令集
                DD.Directive.initViewDirectives(el);
                
                //设置模块是否需要数据
                if(el.$hasDirective('model')){
                    module.needData = true;
                }
                
                //遍历childNodes进行指令、表达式处理
                var nodes = el.childNodes;
                for(var i=0;i<nodes.length;i++){
                    var node = nodes[i];
                    switch(node.nodeType){
                        case Node.TEXT_NODE:        // 文本
                            // 处理文本表达式
                            if(node.textContent !== ''){
                                if(/\{\{.+\}\}?/.test(node.textContent)){
                                    module.needData = true;
                                    //处理表达式
                                    node.$exprs = DD.Expression.initExpr(node.textContent,module);
                                    node.textContent = '';
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
    }
}());
/**
 * @description 异常处理类
 * @author      yanglei
 * @since       1.0.0
 */

DD.Error = {
   /**
    * 按照消息编号进行处理并返回消息内容
    * @param 异常名
    * @param args1,args2,args3,... 待替换的参数
    * @return 转换后的消息
    */
   
   handle:function(errname){
      var reg = new RegExp(/\{.+?\}/);
      
      var msg = DD.ErrorMsgs[errname];
      if(msg === undefined){
        return "未知错误";
      }
      var args = [msg];
      for(var i=1;i<arguments.length;i++){
        args.push(arguments[i]);
      }
      return DD.compileStr.apply(DD,args);
   }
};
/**
 * 路由，主要用于模块间跳转，一个应用中存在一个router，多个route，route节点采用双向链表存储
 * @author 		yanglei
 * @since 		1.0.0
 * @date		2017-01-21
 * @description	采用修改页面hash方式进行路由历史控制，每个route 可设置onEnter事件(钩子) 和 onLeave事件(钩子)
 * 回调调用的几个问题
 * onLeave事件在路由切换时响应，如果存在多级路由切换，则从底一直到相同祖先路由，都会进行onLeave事件响应
 *  如：从/r1/r2/r3  到 /r1/r4/r5，则onLeave响应顺序为r3、r2
 *  onEnter事件则从上往下执行
 */

(function(){
	DD.Router={
		routes:[],				// 路由集合，树形结构
		links:[],				// 路由加载链
		root:'',				// 路由根路径
		currentLinks:[],		// 当前路由对应的加载链
		donop:false,			// 路由切换什么都不做
		loading:false,			// 是否正在进行链式加载
		switching:false,		// 是否正在做切换效果
		switch:{			
			style:'none',		// 切换方式支持none，slide , fade
			time:'0.5s'			// 切换时间，默认0.5秒
		},
		currentState:null,		// 当前状态
		history:0,				// 历史节点长度
		histories:[],			// 历史记录
		currentPath:undefined, 	// 当前路径
		/**
		 * 添加路由
		 * @param route 	路由
		 * @param parent  	父路由
		 */
		addRoute:function(route){
			var me = this;
			//处理树形结构
			if(!route.parent){
				me.routes.push(route);
			}
		},
		/**
		 * 移除路由
		 * @param route 	待移除的路由
		 */
		removeRoute:function(route){
			var me = this;
			var rarr;
			if(route.parent){
				rarr = route.parent.routes;
			}else{
				rarr = me.routes;
			}
			//从数组移除
			rarr.splice(rarr.indexOf(route),1);
		},
		/**
		 * 设置路由加载完标志
		 */
		setRouteFinish:function(module){
			var me = this;
			if(me.current && me.current.module === module){
				me.current.loading = false;
			}
		},
		/**
		 * 链式加载
		 */
		linkLoad:function(){
			var me = this;
			//当前route未加载完，不加载下一个
			if(me.current && me.current.loading){
				return;
			}
			if(me.links.length>0){
				var r = me.links.shift();
				r.start();
			}else{
				me.loading = false;
			}
		},

		/**
		 * 获取路由
		 * @param path 	路径
		 * @return 		路由
		 */
		find:function(path){
			var me = this;
			var links = me.getRouteLink(path);
			if(links.length>0){
				return links[links.length-1];
			}
			return null; 
		},
		/**
		 * 根据路径获取路由链
		 * @param path 	路径
		 * @return 		路由链
		 */
		getRouteLink:function(path){
			var me = this;
			var links = [];
			find(me.routes,path);
			return links;
			
			/**
			 * 从数组中查找匹配的路由
			 * @param routeArr 	路由数组
			 * @param path 		路径
			 */
			function find(routeArr,path){
				if(!DD.isArray(routeArr) || DD.isEmpty(path)){
					return null;
				}
				var r1; //存储匹配最多的route
				for(var i=0;i<routeArr.length;i++){
					var r = routeArr[i];
					if(r.path === path){
						links.push(r);
						return r;
					}else if(path.indexOf(r.path+'/')===0){
						if(!r1 || r1.path.length<r.path.length){
							r1 = r;
						}
					}
				}
				if(r1){
					//路由入加载链
					links.push(r1);
					//去掉路由路径中的空格
					var path1 = path.substr(r1.path.length);
					//不要第一根横线来split
					var arr = path1.substr(1).split('/');
					//查找子路由
					var rsub;
					if(DD.isArray(r1.routes)){
						rsub = find(r1.routes,path1);
					}
					if(rsub !== null){
						return rsub;
					}else{
						// 查找参数匹配
						if(r1.type === 'param'){
							var len = arr.length<=r1.paramNames.length?arr.length:r1.paramNames.length;
							var data = {};
							// 取参数
							for(var i=0;i<len;i++){
								data[r1.paramNames[i]] = arr[i];
							}
							r1.newData = data;
							//路径只剩下参数，直接赋值，返回
							if(arr.length <= r1.paramNames.length){
								return r1;
							}
							//剩下参数还有子路由路径
							arr.splice(0,r1.paramNames.length);
							path1 = '/' + arr.join('/');
							//去参数后子路由查找
							if(DD.isArray(r1.routes)){
								return find(r1.routes,path1);
							}
						}
					}
				}
				return null;
			}
		},

		/**
		 * 启动路由
		 * @param path  	路径
		 # @param forward	true表示点击加载路由，false表示从history出来，默认true
		 * @param replace 	替换当前路由的历史记录，默认false
		 */
		start:function(path,forward,replace){
			var me = this;
			path = path.trim();
			if(DD.isEmpty(path)){
				return;
			}
			if(me.currentPath === path){
				return true;
			}
			if(forward !== false){
				forward = true;
			}
			// 清空加载链
			me.links = [];
			var links = me.getRouteLink(path);
			var isChild = false;   //是否为当前路由子路由
			var parentRoute = null;  //共同的祖先路由
			//如果已存在路由，则表示已经跳转过，需要处理
			if(me.currentLinks.length>0){
				var s1 = '';
				var delInd = -1;
				//取长度更大的那个作为遍历长度
				var len = links.length>me.currentLinks.length?links.length:me.currentLinks.length;
				
				var delInd = len;
				for(var i=0;i<len;i++){
					if(me.currentLinks[i] !== links[i]){
						delInd = i;
						break;
					}
				}
				//相同路由链，但参数不同的情况或跳到父路由
				if(delInd === links.length && me.currentLinks.length >= links.length){
					delInd--;
				}else if(delInd === me.currentLinks.length){
					isChild = true;
				}
				parentRoute = links[delInd];
				links.splice(0,delInd);

				//从当前route开始到共同祖先为止进行onLeave钩子调用
				for(var i=me.currentLinks.length-1;i>=delInd;i--){
					var r = me.currentLinks[i];
					if(!r){
						break;
					}
					//删除r对应module的view
					clearView(r.module);
					if(DD.isFunction(r.onLeave)){
						r.onLeave(r.module.model);
					}
					//移除不要的节点
					me.currentLinks.pop();
				}

				//把新路由添加到currentLinks
				me.currentLinks = me.currentLinks.concat(links);
			}else{
				me.currentLinks = [].concat(links);
			}

			//不能做路由切换
			if((me.loading || me.switch.style!=='none' && me.switching)){
				if(isChild){  //追加到加载链后面
					me.links = me.links.concat(links);
				}else{
					//终止当前路由
					me.setRouteFinish(me.current.module);
					//截断后续所有路由
					if(parentRoute){
						var index = me.links.indexOf(parentRoute);
						if(index !== -1){
							me.links.splice(index+1,me.links.length);
						}
						//把新的links添加到links后
						me.links = me.links.concat(links);	
					}else{
						me.links = links;
					}
				}
			}else{
				me.links = links;
			}

			//设置当前path
			me.currentPath = path;
			
			if(me.links.length===0){
				throw DD.Error.handle('notexist1',DD.words.route,path);
			}
			//设置加载状态
			me.loading = true;
			//把路径pushstate
			if(forward){
				var absPath = getAbsPath(path);
				//替换当前历史
				if(replace){
					history.replaceState(me.currentState,'', absPath);
					if(me.histories.length>0){
						me.histories[me.histories.length-1] = path;
					}
				}else{ //添加到历史
					me.currentState = {path:path,index:me.history++,forward:true};
					history.pushState(me.currentState,'', absPath);
					me.histories.push(path);
				}
			}
			setTimeout(function(){me.linkLoad();},0);
		
			return true;
			
			/**
			 * 清空moduleview
			 */
			function clearView(m){
				if(!m){
					return;
				}
				m.view = null;
				//设置渲染标志
				if(DD.isArray(m.modules)){
					m.modules.forEach(function(m1){
						clearView(m1);
					});
				}
			}
		},
		/**
		 * 历史回退
		 * @param path 		路径
		 * @param direction 方向  0 history.back  1history.forward，默认0
		 */
		go:function(path,direction){
			var me = this;
			if(DD.isEmpty(path)){
				throw DD.Error.handle('DD.Router.back','path',0,'string');
			}
			//默认0
			direction = direction || 0;

			var index = me.currentState.index;
			var steps = 0;
			var finded = false;
			//forward
			if(direction){
				for(index++,steps++;index<me.histories.length;index++,steps++){
					//找到则退出
					if(me.histories[index] === path){
						finded = true;
						break;
					}
				}
			}else{ //back
				for(steps--,index--;index>=0;index--,steps--){
					//找到则退出
					if(me.histories[index] === path){
						finded = true;
						break;
					}
				}
			}
			if(finded){
				history.go(steps);
			}else{
				//没找到则启动路径路由
				me.start(path);
			}
		}
	};
	
	
	//处理popstate事件
	window.addEventListener('popstate' , function(e){
		var me = DD.Router;
		//根据state切换module
		var state = history.state;
		if(state){
			var fw = me.currentState && state.index < me.currentState.index?false:true;
			//如果能切换到该路由，则进行相应操作
			if(me.start(state.path,false)){
				me.currentState = state;
				//设置forward
				me.currentState.forward = fw;
			}
		}
	});

	/**
	 * Route 类
	 * @param config	路由参数对象
	 *			path: 	路由路径
	 *          module: 路由加载的模块 
	 * 			parent: 父路由 (可选)
	 *          routes: 子路由集合(可选)   
	 */
	var Route = function(config){
		var me = this;

		if(DD.isEmpty(config) || !DD.isObject(config)){
			throw DD.Error.handle('invoke','route',0,'object');
		}
		if(DD.isEmpty(config.module) && !config.module instanceof DD.module){
			throw DD.Error.handle('invoke2','route','module',DD.words.module,'string');	
		}
		//复制属性
		DD.assign(me,config);

		//保存module或moduleName
		me.module = config.module;
		//设置router
		me.routes = [];		//存放子路由
		me.type = 'string';	//路由类型
		var ind;
		//匹配/:  带参数的路径
		if((ind=me.path.indexOf('/:')) !== -1){
			me.type = 'param';
			var arr = me.path.split('/:');
			// 保存route基础路径
			me.path = arr[0];
			// 保存参数名数组
			me.paramNames = arr.slice(1);
		}
		//添加到父对象的route列表
		if(me.parent){
			me.parent.routes.push(me);	
		}
		
		//添加到router
		DD.Router.addRoute(me);
		// 把子路由添加到路由树
		if(config.routes){
			config.routes.forEach(function(r){
				me.add(r);
			});
		}
	};

	/**
	 * 获取路由完整路径
	 */
	Route.prototype.getFullPath = function(){
		var me = this;
		var path = '';
		for(var r=me;r;r=r.parent){
			var p = '';
			//加参数
			if(r.paramNames){
				r.paramNames.forEach(function(p1){
					if(r.data[p1]!==undefined){
						p += '/' + r.data[p1];
					}
				});
			}
			p = r.path + p;
			path = p + path;
		}
		return path;
	}
	/**
	 * 路由启动
	 */
	Route.prototype.start = function(){
		var me = this;
		var router = DD.Router;
		//设置当前路由
		router.current = me;
		me.loading = true;

		// 数据更新
		me.data = me.newData;
		delete me.newData;
		//获取module
		if(DD.isString(me.module)){
			var mn = me.module;
			me.module = DD.Module.get(mn);
			if(me.module === undefined){
				throw DD.Error.handle('notexist1',DD.words.module,mn);	
			}	
		}
		
		//找到对应的route view 并设置active
		var pview;
		if(me.parent){
			pview = me.parent.module.view;
		}else{
			pview = DD.App.view;
		}
		var routeEl = DD.get("[path='"+ me.getFullPath() +"']",false,pview);
		if(routeEl && routeEl.$routeConfig && routeEl.$routeConfig.active){
			changeActive(routeEl);
		}

		//模块尚未初始化，先初始化，在进行路由切换
		if(!me.module.inited){
			me.module.init(function(){
				doRender();
			});
		}else{
			doRender();
		}

		//执行渲染
		function doRender(path){ //渲染模块到routerview中
			var view;
			
			//初始化module数据
			if(!me.module.model){
				new DD.Model({data:{},module:me.module});
			}
			//增加$route数据
			me.module.model.data.$set('$route',{path:me.getFullPath(),data:me.data});
			
			//设置forceRender
			me.module.setForceRender(true);
			//调用onEnter钩子
			if(DD.isFunction(me.onEnter)){
				me.onEnter(me.module.model);
			}

			if(me.parent){
				view = me.parent.module.routerView;
			}else{
				view = DD.App.routerView;
			}
			
			// 设置切换动画
			if(router.switch && router.switch.style === 'slide'){  //滑屏
				var divs = view.children;
				var slideCt;
				var width = DD.width(view,true);
				//保存overflowX属性
				var overflow = DD.css(view,'overflowX');
				var divo,divn;
				if(view.children.length === 0){
					divn = view;
				}else{
					slideCt = DD.newEl('div');
					DD.css(view,{
						overflowX:'hidden'
					});

					DD.css(slideCt,{
						boxSizing:'border-box',
						width:width*2+ 'px',
						padding:0,
						margin:0,
						transition:'transform ' + router.switch.time + ' ease-out',
						transform:'translate3d(0,0,0)',
						transformStyle: 'preserve-3d',
						overflowX:'hidden'
					});
					// 设置动画结束操作
					slideCt.addEventListener('transitionend',function(){
						//还原overflow
						DD.css(view,'overflowX',overflow);
						if(slideCt.children.length>1){
							DD.remove(slideCt);
							DD.transChildren(divn,view);
							//还原module view
							me.module.view = view;

							//设置切换完成
							router.switching = false;
							// 改变移动效果，设置marginLeft
							setTimeout(function(){
								DD.css(slideCt,'transition','transform ' + router.switch.time + ' ease-out');
							},50);
						}
					});

					var divo = DD.newEl('div');
					var divn = DD.newEl('div');

					//创建老view
					DD.css(divo,{
						width:width+'px',
						float:'left',
						overflowX:overflow
					});
					//创建新view
					DD.css(divn,{
						width:width+'px',
						float:'left',
						overflowX:overflow
					});
					
					router.switching = true;

					//新建的div扩展成view
					DD.merge(divn,DD.extendElementConfig);
            		divn.$isView = true;
            		//复制字节点
					DD.transChildren(view,divo);
					slideCt.appendChild(divo);
					view.appendChild(slideCt);
					//确定移动方向
					var forward = DD.Router.currentState && !DD.Router.currentState.forward?false:true;		
					if(forward){
						slideCt.appendChild(divn);
						setTimeout(function(){
							DD.css(slideCt,'transform','translate3d(-'+ width +'px,0,0)');		
						},50);
					}else{
						DD.css(slideCt,{
							transition: '',
							transform: 'translate3d(-'+ width +'px,0,0)'
						});
						slideCt.insertBefore(divn,divo);
						//延时设置移动
						setTimeout(function(){
							DD.css(slideCt,{
								transition:'transform ' + router.switch.time + ' ease-out',
								transform: 'translate3d(0,0,0)'
							});
						},50);
					}
				}
				me.module.view = divn;
			}else if(router.switch && router.switch.style === 'fade'){ //淡出淡入

			}else{
				if(!view){
					throw DD.Error.handle('notexist',DD.words.routeView);
				}
				me.module.view = view;
				DD.empty(me.module.view);
			}
			// 添加渲染子节点标志
			me.module.renderChildren = true;
			DD.Renderer.add(me.module);
		}
	}
	
	/**
	 * 添加子路由
	 * @param config 路由参数对象，参考Route
	 */
	Route.prototype.add = function(config){
		var me = this;
		config.parent = me;
		var route = config;
		if(!(config instanceof DD.Route)){
			route = new Route(config);
		}
		return route;
	}

	DD.Route = Route;

	/**
	 * 创建路由
	 * @param config  路由配置对象或数组对象(多个路由)
	 */
	DD.createRoute = function(config){
		if(DD.isArray(config)){
			config.forEach(function(cfg){
				new DD.Route(cfg);
			});
		}else if(DD.isObject(config)){
			return new DD.Route(config);		
		}
	}


	//增加route指令
	DD.Directive.create({
		name:'route',
		preOrder:10,
		init:function(value){
			var view = this;
			if(!value){
	            return;
	        }
	        value = value.trim();
	        if(DD.isEmpty(value)){
	            return;
	        }
            // 未解析的表达式，不处理
            if(value && value.substr(0,2) === '{{' && value.substr(value.length-2,2) === '}}'){
                return;
            }

			// 设置path
			DD.attr(view,'path',value);

			view.$routeConfig={
				path:value,
				active:DD.attr(view,'active')
			};

			view.removeAttribute('active');

			//绑定click事件
			new DD.Event({
				view:view,
				eventName:'click',
				handler:function(e,data,v){
					if(v.$routeConfig && v.$routeConfig.active){
		        		changeActive(v);
			   		}else{
			   			DD.Router.start(view.$routeConfig['path']);

			   		}
			    }
			});
		},
		handler:function(){
			var view = this;
			var path = view.$routeConfig['path'];
			var an = view.$routeConfig['active'];   //active name
	   		//如果路由链未加载完，则不处理active=true的view
	   		if(DD.Router.links.length > 0){
	   			return;
	   		}
	   				
	   		var active;
   			if(an){
   				var data = view.$getData().data;
	   			if(data && data[an] === true){   //当前节点active
	   				active = true;
	   			}
			}
			if(active){
				//如果当前路径和routeview 的路径相同则返回
				changeActive(view,path);
				if(DD.Router.current && path === DD.Router.current.getFullPath()){
					return;
				}
	   			setTimeout(function(){
   					//子路由，需要replacestate
   					if(path.indexOf(DD.Router.currentPath) === 0){
   						DD.Router.start(view.$routeConfig.path,true,true);	
   					}else{
   						DD.Router.start(view.$routeConfig.path);	
   					}
	            },0);
	   		}
		}
	});

	/**
	 * 更改当前activeclass
	 * @param path 	路径
	 */
	function changeActive(view){
		//已经是激活状态，不再激活
		if(DD.attr(view,'role') === 'activeroute'){
			return;
		}

		//当前active route view 存在，需要修改其active数据项为false
		//查找当前处于激活状态的路由元素
		var oroute,pview;
		for(pview=view.parentNode;!oroute && pview;pview=pview.parentNode){
			// oroute = DD.get("[role='activeroute']",false,pview);
			var rvs = DD.get('[path]',true,pview);
			//找到数据为active的路由view
			for(var i=0;i<rvs.length;i++){
				var rv = rvs[i];
				//自己不比较
				if(rv === view){
					continue;
				}
				//数据为true，则需要更换
				if(rv && rv.$routeConfig.active){
					var d = rv.$getData().data;
					if(d && d[rv.$routeConfig.active]){
						oroute = rv;
						break;
					}
				}
			}
			
			//到达module view则不再查找
			if(pview === view.$module.view){
				break;
			}
		}
		if(oroute){
			oroute.removeAttribute('role');
			var an=oroute.$routeConfig.active;
			if(an){
 				var data = oroute.$getData().data;
				if(data){
					data.$set(an,false);
				}
			}
		}
		//设置当前active route 数据
		var active;
   		var an = view.$routeConfig.active;
   		if(an){
   			var model = view.$getData();
   			if(model.data){
   				model.data.$set(an,true);
   			}
   			DD.attr(view,'role','activeroute');
   		}
	}

	//创建router指令
	DD.Directive.create({
		name:'router',
		preOrder:10,
		init:function(value){
		    this.$isRouterView = true;
		},
		handler:function(){
			this.$module.routerView = this;
		}
	});

	function getAbsPath(path){
		return DD.Router.root + path;
	}
}());
'use strict';
/**
 * @description 字段和校验指令
 * @author      yanglei
 * @since       1.0.0
 */

            
(function(){
    DD.Directive.create({
        name:'validity',
        preOrder:5,
        init:initvalidity,
        handler:dovalidity
    });
    
    DD.$validity = {
        valid:true,
        form:null,      //当前form
        /**
         * 检测所有字段，判断其有效性，如果都有效，则返回true，否则返回false
         * @param return true/false
         */
        check:function(){
            return DD.$validity.valid;
        }
    }

    function findEl(view,fn){
        //找到form
        var form;
        for(var el=view.parentNode;el;el=el.parentNode){
            if(el.tagName === 'FORM'){
                form = el;
            }
        }
        if(form){
            // 找到要校验的输入框
            return [form.querySelector("[name='"+ fn +"']"),form];
        }
        return null;
    }
    /**
     * 初始化valid指令
     */
    function initvalidity(value){
        var view = this;
        var ind,fn=value,method;
        //处理带自定义校验方法
        if((ind=value.indexOf('|')) !== -1){
            fn = value.substr(0,ind);
            method=value.substr(ind+1);
        }

        view.$validity = {fn:fn,tips:{},method:method};
        var nodes = view.children;
        //异常消息
        for(var i=0;i<nodes.length;i++){
            var rel = nodes[i].getAttribute('rel');
            view.$validity.tips[rel] = nodes[i];
        }
        view.$savedDoms['validity'] = view;
        //清空
        DD.empty(view);
        //创建占位符
        var tnode = document.createTextNode("");
        DD.replaceNode(view,tnode);
    }
    

    /**
     * valid指令执行
     */
    function dovalidity(directive){
        var view = this;

        if(DD.isEmpty(directive)){
            directive = view.$getDirective('validity');
        }
        
        //首次渲染不执行
        if(!view.$validity || !view.$rendered){
            return;
        }

        var els = findEl(view,view.$validity.fn);
        if(!els){
            return;
        }
        var el = els[0];
        
        var form = els[1];

        //如果form不同，则clear原有校验内容
        if(DD.$validity.form !== form){
            DD.$validity.valid = true;
            DD.$validity.form = form;
        }


        //清除之前的校验提示
        if(view.nextSibling.$fromNode === view){
            DD.remove(view.nextSibling);
        }

        var vn; //校验字段名
        if(el !== null){
            //自定义方法校验
            var validArr = [];
            if(view.$validity.method){
                var foo = view.$module.methodFactory.get(view.$validity.method);
                if(DD.isFunction(foo)){
                    var r = foo.call(view.$module,el.value);
                    if(!r){
                        validArr.push('custum');
                    }
                }
            }

            var vld = el.validity;
            
            if(!vld.valid){
                // 查找校验异常属性
                for(var o in vld){
                    if(vld[o] === true) {
                        validArr.push(o);
                    }
                }
            }

            if(validArr.length>0){
                //设置全局$validity.valid属性
                DD.$validity.valid = false;
                var vn = handle(validArr);
                var tips = view.$validity.tips;
                var node = view.$savedDoms['validity'].cloneNode(false);
                node.$fromNode = view;
                //用户定义的提示
                if(DD.isEl(tips[vn])){
                    node.appendChild(tips[vn]);
                }else{ //系统自带提示
                    var tn = document.createTextNode(DD.compileStr(DD.FormMsgs[vn],DD.attr(el,vn)));
                    node.appendChild(tn);
                }
                //插入到占位符后
                DD.insertAfter(node,view);
            }
            
        }
        function handle(arr){
            for(var i=0;i<arr.length;i++){
                switch(arr[i]){
                    case 'valueMissing':
                        return 'required';
                    case 'typeMismatch':
                        return 'type';
                    case 'tooLong':
                        return 'maxLength';
                    case 'tooShort':
                        return 'minLength';
                    case 'rangeUnderflow':
                        return 'min';
                    case 'rangeOverflow':
                        return 'max';
                    case 'patternMismatch':
                        return 'pattern';
                }
            }
        }
    }
}());
/**
 * 插件类
 */
(function(){
	DD.Directive.create({
		name:'plugin',
		proOrder:10,
		init:function(value){
			var view = this;
			var clazz = DD.Plugin.plugins[value];
			if(!DD.isFunction(clazz)){
				 throw DD.Error.handle('notexist1',DD.words.plugin,value);   
			}
			view.$plugin = new clazz(view);
			view.$plugin.init(view);
		},
		handler:function(){
			var view = this;
			var model = view.$getData();
			//数据更改或强制渲染，则渲染插件
			if(model && model.data && model.data.$isChanged(true) || view.$forceRender || view.$module.forceRender){
				view.$plugin.render(view);	
			}
		}
	});
	DD.Plugin = {
		plugins:{},
		create:function(name,clazz){
			//插件已存在
			if(this.plugins[name]){
				throw DD.Error.handle('exist1',DD.words.plugin,name);
			}
			this.plugins[name] = clazz;
		},
		remove:function(name){
			delete this.plugins[name];
		}
	}
}());
/*
 * 消息js文件 中文文件
 * @author yanglei
 * @since  v1.0
 * @date   2017-2-25
 */
DD.words = {
	system:"系统",
	module:"模块",
	moduleClass:'模块类',
	model:"模型",
	directive:"指令",
	expression:"表达式",
	event:"事件",
	method:"方法",
	filter:"过滤器",
	data:"数据",
	dataItem:'数据项',
	route:'路由',
	routeView:'路由容器',
	plugin:'插件'
};
/*异常消息*/
DD.ErrorMsgs = {
	"unknown":"未知错误",
	"paramException":"{0} {1}方法参数错误，请参考api",
	"invoke":"{0}方法调用参数{1}必须为{2}",
	"invoke1":"{0}方法调用参数{1}必须为{2}或{3}",
	"invoke2":"{0}方法调用参数{1}或{2}必须为{3}",
	"invoke3":"{0}方法调用参数{1}不能为空",
	"exist":"{0}已存在",
	"exist1":"{0} {1}已存在",
	"notexist":"{0}不存在",
	"notexist1":"{0} {1}不存在",
	'notupd':'{0}不可修改',
	'notremove':'{0}不可删除',
	'notremove1':'{0}{1}不可删除'
};

/*form消息*/
DD.FormMsgs = {
	"type":"请输入有效的{0}",
	"unknown":"输入错误",
	"required":"不能为空",
	"min":"最小输入值为{0}",
	"max":"最大输入值为{0}"
};
(function(){
	var LEGENDWORDLEN = 12;					//legend字符宽度
	var WORDLEN = 10;						//普通字符宽度
	var TITLEWORDLEN = 18;					//图表标题字符宽度
	var TITLEHEIGHT=30;						//title高度
	var SPACELEN = 30;						//坐标轴多余数据宽度
	var DrawArea = {						//绘制区域
		left:0,
		top:0
	};
	var DEFAULTS = {
		type:'line',					//图表类型
		dataName:undefined,				//绑定数据名
		width:400,						//宽度
		height:600,						//高度
		bgColor:'#fff',					//背景色
		margins:[40,40,20,20],			//margin
		category:['number','number'],	//x,y轴数据类型
		title:undefined,				//主标题
		xTitle:undefined, 				//x轴标题
		yTitle:undefined,				//y轴标题
		legend:undefined,				//legend显示位置
		titleColor:'#000',				//标题和刻度文字颜色
		colors:undefined,				//线条或pie颜色
		fixedCnt:[0,0],					//小数位数
		marker:false,					//曲线中显示marker
		showPercent:false,				//显示百分比
		showText:false,					//显示文本线
		gridLine:0,						//网格线 1横线 2竖线 3全部
		gridLineColor:'#ccc'            //网格线颜色
	};

	/**
	 * @param config
	 *			el: 	element selector
	 * 			module: 模块
	 * 			model: 	模型 		
	 */
	var Chart = function(config){
	
	}


	/**
	 * 初始化方法
	 */
	Chart.prototype.init = function(view){
		var me = this;
		
		me.view = view;
		me.svg = DD.newSvgEl('svg');
		view.appendChild(me.svg);
		DD.attr(me.svg,{
			width:'100%',
			height:'100%'
		});
		DD.css(me.svg,{
			fontSize:12,
			background:me.bgColor
		});
	}

	/**
	 * 渲染方法
	 */
	Chart.prototype.render = function(view){
		var me = this;

		var obj = getConfig(view,DEFAULTS);
		//如果没有设置width和height，则需要从view获取
		if(!obj.width || !obj.height){
			var width = DD.width(view);
			//存在渲染延时问题，延迟再获取width和height
			if(!width){
				setTimeout(function(){
					me.render(view);
				},50);
				return;
			}
			obj.width = width;
			obj.height = DD.height(view);
		}
		
		DD.extend(me,DEFAULTS,obj);
		me.view = view;
		me.svg = me.view.children[0];
		DD.attr(me.svg,{
			width:me.width,
			height:me.height
		});
		
		DD.empty(me.svg);
		//获取数据
		var model = view.$getData();
		me.data = model.data;

		if(me.dataName){
			me.data = me.data[me.dataName];
		}
		if(!me.data){
			return;
		}

		//设置绘图区域
		DrawArea = {
			top: me.margins[0],
			left: me.margins[3],
			width:me.width - me.margins[1] - me.margins[3],
			height:me.height - me.margins[0] - me.margins[2]	
		}

		switch(me.type){
			case 'line':
				me.drawLine();
				break;
			case 'histogram':
				me.drawHistogram();
				break;
			case 'pie':
				me.drawPie();
				break;
		}
	}


	/**
	 * 获取颜色
	 * @param chart 	图表对象
	 * @param index 	颜色索引
	 */
	function getColor(chart,index){
		var colors = [[179,33,38],[36,53,66],[80,142,150],[200,109,82],[129,188,158]]
		// 如果有用户自定义颜色，则直接取
		if(chart.colors && chart.colors.length>index){
			return chart.colors[index];
		}else{
			var r,g,b;
			//0-4 号索引，取colors数组
			if(index<5){
				var ar = colors[index];
				r = ar[0];
				g = ar[1];
				b = ar[2];
			}else{ //>=5，以基色生成
				var ind1 = (index/5)|0;
				var ind2 = index%5;
				var ar = colors[ind2];
				r = ar[0] + 30*ind1;
				g = ar[1] + 30*ind1;
				b = ar[2] + 30*ind1;
				if(r > 255){
					r = r%255;
				}
				if(g > 255){
					g = g%255;
				}
				if(b > 255){
					b = g%255;
				}
			}
			return 'rgb(' + r + ',' + g + ',' + b + ')';
		}
	}

	/**
	 * 获取配置
	 * @param el 	element
	 * @param obj 	default 参数 
	 */
	function getConfig(el,obj){
		var arrs = ['margins','colors','fixedCnt','category'];
		var numbers = ['margins','width','height','gridLine','fixedCnt'];
		var obj1 = {};
		DD.getOwnProps(obj).forEach(function(pn){
			var attr = DD.attr(el,pn.toLowerCase());
			if(attr){
				if(!attr){
					return;
				}
				var pv = attr.trim();
				//是否数组标志
				var isArr = false;
				//数组
				if(arrs.indexOf(pn) !== -1){
					pv = pv.split(',');
					isArr = true;
				}
				//数值需要进行数据类型转换
				if(numbers.indexOf(pn) !== -1){
					if(isArr){
						pv.forEach(function(v,i){
							try{
								pv[i] = eval(v);
							}catch(e){}
						});
					}else{
						try{
							pv = eval(pv);	
						}catch(e){}
						
					}
				}
				//bool型处理
				if(pv === 'true' || pv === 'false'){
					pv = eval(pv);
				}

				obj1[pn] = pv;
				// el.removeAttribute(pn);
			}
		});
		return obj1;
	}

	/**
	 * 初始化marker
	 * @param flag  是否初始化折线marker，默认false
	 * @return 		markers
	 */
	//初始化defs
	function initDefs(svg,flag){
		var defs = DD.newSvgEl('defs');
		
		svg.appendChild(defs);

		//坐标轴箭头
		var arrow = DD.newSvgEl('marker');
		DD.attr(arrow,{
			id:'$chart_arrow',
			viewBox:'0 0 10 10',
			refX:1,
			refY:5,
			markerWidth:6,
			markerHeight:6,
			orient:'auto'
		});
		var path = DD.newSvgEl('path');
		DD.attr(path,{
			d:'M 0 0 L 10 5 L 0 10 z'
		});
		arrow.appendChild(path);
		defs.appendChild(arrow);
		
		if(!flag){
			return;
		}

		//圆圈
		var circle = DD.newSvgEl('marker');
		DD.attr(circle,{
			id:'$chart_circle',
			refX:3,
			refY:3,
			markerWidth:8,
			markerHeight:8,
			orient:'auto'
		});
		var c = DD.newSvgEl('circle');
		DD.attr(c,{
			cx:3,
			cy:3,
			r:1.5
		});
		circle.appendChild(c);
		defs.appendChild(circle);
		
		//三角形
		var tri = DD.newSvgEl('marker');
		DD.attr(tri,{
			id:'$chart_tri',
			viewBox:[0,0,20,20],
			refX:5,
			refY:6,
			markerWidth:9,
			markerHeight:9,
			orient:'auto'
		});
		var c = DD.newSvgEl('polygon');
		DD.attr(c,{
			points:'0,10 5,3 10,10'
		});
		tri.appendChild(c);
		defs.appendChild(tri);

		//方形
		var rect = DD.newSvgEl('marker');
		DD.attr(rect,{
			id:'$chart_rect',
			refX:2,
			refY:2,
			markerWidth:5,
			markerHeight:5,
			orient:'auto'
		});
		var r = DD.newSvgEl('rect');
		DD.attr(r,{
			x:0,
			y:0,
			width:3,
			height:3
		});
		rect.appendChild(r);
		defs.appendChild(rect);
		
		//叉
		var cross = DD.newSvgEl('marker');
		DD.attr(cross,{
			id:'$chart_cross',
			viewBox:[0,0,10,10],
			refX:3,
			refY:3,
			markerWidth:6,
			markerHeight:6,
			orient:'auto',
			stroke:'black'
		});
		var p = DD.newSvgEl('path');
		DD.attr(p,{
			d:'M0 0 L6 6 M0 6 L6 0 Z',
			'stroke-width':2,
			fill:'none',
		});
		cross.appendChild(p);
		defs.appendChild(cross);
		//五角星
		var star = DD.newSvgEl('marker');
		DD.attr(star,{
			id:'$chart_star',
			viewBox:[0,0,35,35],
			refX:7,
			refY:7,
			markerWidth:15,
			markerHeight:15,
			orient:'auto',
			stroke:'black'
		});
		var p = DD.newSvgEl('path');
		DD.attr(p,{
			d:'m0.75,5.385069l4.20154,0l1.29846,-4.201666l1.29846,4.201666l4.20154,0l-3.399233,2.596676l1.298462,4.201661l-3.399229,-2.596801l-3.399227,2.596801l1.29846,-4.201661l-3.399233,-2.596676l0,0z',
			'stroke-width':1
		});
		star.appendChild(p);
		defs.appendChild(star);
		var markers = [];
		markers.push({id:'$chart_circle',m:circle});
		markers.push({id:'$chart_tri',m:tri});
		markers.push({id:'$chart_rect',m:rect});
		markers.push({id:'$chart_star',m:star});
		markers.push({id:'$chart_cross',m:cross});
		return markers;
	}

	/**
	 * 初始化数据，排序并设置xy轴类型number 和 string
	 */
	Chart.prototype.initData = function(){
		var me = this;
		//数据排序并查找最大x，y
		var minx,maxx,miny,maxy;
		var xValues =[],yValues = [];   //存放非number的xy值
		for(var ii=0;ii<me.data.length;ii++){
			var d = me.data[ii];
			d.datas.sort(function(a,b){
				return a.x - b.x;
			});
			//设置默认title
			if(!d.title){
				d.title = '数据' + ii;
			}
			//查找最大最小xy或设置xvalues，yvalues
			for(var i=0;i<d.datas.length;i++){
				var d1 = d.datas[i];
				if(me.category[0] === 'number'){
					if(!minx || d1.x<minx){
						minx = d1.x;
					}
					if(!maxx || d1.x>maxx){
						maxx = d1.x;
					}	
				}else{
					if(xValues.indexOf(d1.x) === -1){
						xValues.push(d1.x);
					}
				}
				
				if(me.category[1] === 'number'){
					if(!miny || d1.y<miny){
						miny = d1.y;
					}
					if(!maxy || d1.y>maxy){
						maxy = d1.y;
					}
				}else{
					d1.y += '';
					if(yValues.indexOf(d1.y) === -1){
						yValues.push(d1.y);
					}
				}
			}	
		}
		if(xValues.length > 0){
			xValues.sort();
		}
		if(yValues.length>0){
			yValues.sort();
		}

		me.dataArea = {
			minx:minx,
			maxx:maxx,
			miny:miny,
			maxy:maxy,
			xValues:xValues,
			yValues:yValues
		};
	}
	/**
	 * 绘制title
	 */
	Chart.prototype.drawTitle = function(){
		var me = this;
		if(!me.title){
			return;
		}
		var title = me.title;
		var len = title.length*TITLEWORDLEN;
		var l = (DrawArea.width - len)/2;
		var t = me.margins[0];
		var text = DD.newSvgEl('text');
		text.innerHTML = title;
		DD.attr(text,{
			transform:'translate(' + l + ',' + t + ')',
			fill:me.titleColor,
			'font-size':18,
			textLength:len
		});
		me.svg.appendChild(text);
		//修改drawArea
		DrawArea.top += TITLEHEIGHT;
		DrawArea.height -= TITLEHEIGHT;

	}

	/**
	 * 绘制legend
	 */
	Chart.prototype.drawLegend = function(){
		var me = this;
		if(me.legend !== 'top' && me.legend !== 'bottom' && me.legend !== 'right'){
			return;
		}
		//计算最长legendword
		var maxlen = 0;
		for(var i=0;i<me.data.length;i++){
			if(me.data[i].title.length > maxlen){
				maxlen = me.data[i].title.length;
			}
		}

		var legendLength = 50+maxlen*WORDLEN;
		var legendCnt = me.data.length;
		var legendHeight = 40;
		var left,top,width,height;
		var dwidth = DrawArea.width; //可绘制区宽度
		// 根据不同类型设置不同宽高并修改DrawArea

		switch(me.legend){
			case 'top':
				top = DrawArea.top;
				//一行放不下
				if(legendCnt * legendLength > dwidth){
					width = dwidth;
					left = DrawArea.left;
					var rows = Math.ceil(legendCnt * legendLength/dwidth);
					height = legendHeight*rows;
				}else{
					width = legendCnt * legendLength;
					height = legendHeight;
					left = (DrawArea.width - width)/2 + DrawArea.left;
				}
				DrawArea.top += height;
				DrawArea.height -= height;
				break;
			case 'right':
				width = legendLength-25;
				height = legendHeight * legendCnt;
				top = DrawArea.top;
				left = DrawArea.left + DrawArea.width - width;
				DrawArea.width -= width;
				break;
			case 'bottom':
				//一行放不下
				if(legendCnt * legendLength > dwidth){
					width = dwidth;
					left = DrawArea.left;
					var rows = Math.ceil(legendCnt * legendLength/dwidth);
					height = legendHeight*rows;
				}else{
					width = legendCnt * legendLength;
					height = legendHeight;
					left = (DrawArea.width - width)/2 + DrawArea.left;
				}
				top = DrawArea.top + DrawArea.height - height;
				DrawArea.height -= height;
		}
		var graphics = DD.newSvgEl('g');
		DD.attr(graphics,{
			transform:'translate(' + left + ',' + top + ')'
		});
		var x = 0;
		var y = 10;
		for(var i=0;i<me.data.length;i++){
			var color = getColor(me,i);
			//绘制矩形
			var rect = DD.newSvgEl('rect');
			DD.attr(rect,{
				x:x,
				y:y,
				rx:5,
				ry:5,
				fill:color,
				width:30,
				height:15
			});
			graphics.appendChild(rect);
			//文字
			var title = me.data[i].title;
			var text = DD.newSvgEl('text');
			text.innerHTML = title;
			DD.attr(text,{
				x:x+35,
				y:y+12,
				fill:color
			});
			DD.css(text,'fontSize',14);
			graphics.appendChild(text);
			if(x + 2*legendLength <= width){
				x += legendLength;
			}else{
				x = 0;
				y += legendHeight;
			}
		}
		me.svg.appendChild(graphics);
	}

	/**
	 * 绘制坐标轴
	 * @param flag 	柱状图坐标
	 */
	Chart.prototype.drawAxes = function(flag){
		var me = this;
		
		//纵坐标文本宽度
		var axLeft = me.category[1]==='number'?(me.dataArea.maxy+'').length:me.dataArea.yValues[0].length;
		axLeft = axLeft * WORDLEN + 20;
		var axBottom = 30;    //横坐标文本高度
 		var left1 = (me.yTitle?10:0) + axLeft;
 		DrawArea.top += SPACELEN;
		
		DrawArea.height -= SPACELEN+(me.xTitle?25:0) + axBottom;
		DrawArea.width -= left1 + SPACELEN+5;
		DrawArea.left += left1;
		

		var width = DrawArea.width;
		var height = DrawArea.height;

		var valueX = me.category[0]==='number'?cacScale(me.dataArea.minx,me.dataArea.maxx):me.dataArea.xValues;
		var valueY = me.category[1]==='number'?cacScale(me.dataArea.miny,me.dataArea.maxy):me.dataArea.yValues;

		//设置全局scaleValue
		var xLen = valueX.length;
		var yLen = valueY.length;
		//0 开始，少一个刻度
		if(valueX[0] === 0){
			xLen--;
		}
		if(valueY[0] === 0){
			yLen--;
		}
		me.scaleValues = {
			x:{
				values:valueX,
				px:width/xLen
			},
			y:{
				values:valueY,
				px:height/yLen
			}
		}
		var graphics = DD.newSvgEl('g');
		DD.attr(graphics,{
			transform:'translate(' + DrawArea.left + ',' + DrawArea.top + ')'
		});
		me.svg.appendChild(graphics);
		drawAxis();

		function drawAxis(){
			var points = '';
			//计算并绘制x轴
			var x=0;
			var y=DrawArea.height;

			var values = me.scaleValues.x.values;
			var px =  me.scaleValues.x.px;
			var len = values[0] === 0?values.length-1:values.length;
			for(var i=0;i<=len;i++,x+=px){
				//处理小数位数
				if(x%1){
				 	x=parseFloat(x.toFixed(me.fixedCnt));
				}
				points += x + ',' + y + ' ';
				//竖线
				if(i>0){
					points += x + ',' + (y-5) + ' ' + x + ',' + y + ' ';
					//网格线
					if(me.gridLine === 2 || me.gridLine === 3){
						var gl = DD.newSvgEl('path');
						DD.attr(gl,{
							d:'M' + x + ' ' + y + ' V 0',
							stroke:me.gridLineColor,
							'stroke-width':1
						});
						graphics.appendChild(gl);
					}

				}
				//x坐标文本
				if(i>0){
					var text = DD.newSvgEl('text');
					var tlen = (values[i-1]+'').length*WORDLEN;
					var l;
					//柱状图
					if(flag === 1 && me.category[0] === 'string'){
						l = (px-tlen)/2 + (i-1) * px;
					}else{
						l = x - tlen/2;
					}
					DD.attr(text,{
						x:l,
						y:y + 20
					});
					DD.css(text,{
						fill:me.titleColor,
						strokeWidth:0
					});
					var ind = values[0] === 0? i:i-1;
					text.innerHTML = values[ind];
					graphics.appendChild(text);	
				}
				
			}
			points += (x - px + SPACELEN) + ',' + y;
			//写xtitle
			if(me.xTitle){
				var txt = DD.newSvgEl('text');
				txt.innerHTML = me.xTitle;
				graphics.appendChild(txt);
				DD.attr(txt,{
					x:(DrawArea.width - me.xTitle.length*12)/2,
					y:y+50
				});
				DD.css(txt,{
					fill:me.titleColor,
					fontSize:14
				});
			}

			//用polyline绘制坐标轴
			var axis = DD.newSvgEl('polyline');
			DD.attr(axis,{
				points:points,
				stroke:me.titleColor,
				'stroke-width':1,
				'marker-end':'url(#$chart_arrow)'
			});
			graphics.appendChild(axis);

			//计算并绘制y轴
			x = 0;
			y = DrawArea.height;
			values = me.scaleValues.y.values;
			px =  me.scaleValues.y.px;
			points = '';
			var len = values[0] === 0?values.length-1:values.length;
			for(var i=0;i<=len;i++,y-=px){
				if(y%1){
					y=parseFloat(y.toFixed(me.fixedCnt[0]));
				}

				points += x + ',' + y + ' ';
				//横线
				if(i>0){
					points += (x+5) + ',' + y + ' ' + x + ',' + y + ' ';
					//网格线
					if(me.gridLine === 1 || me.gridLine === 3){
						var gl = DD.newSvgEl('path');
						DD.attr(gl,{
							d:'M' + x + ' ' + y + ' H ' + (DrawArea.width),
							stroke:me.gridLineColor,
							'stroke-width':1
						});
						graphics.appendChild(gl);
					}
				}

				//刻度文本
				if(i>0){
					var text = DD.newSvgEl('text');
					DD.attr(text,{
						x:x - (values[i-1]+'').length*WORDLEN - 10,
						y:y+4
					});
					DD.css(text,{
						fill:me.titleColor,
						strokeWidth:0
					});
					var ind = values[0] === 0? i:i-1;
					text.innerHTML = values[ind];
					graphics.appendChild(text);
				}
			}
			points += x + ',' + (y + px - SPACELEN);
			//写ytitle
			if(me.yTitle){
				var txt = DD.newSvgEl('text');
				txt.innerHTML = me.yTitle;
				var wordLen = me.yTitle.length*12;
				var y1 = (DrawArea.height - wordLen)/2-20;

				DD.attr(txt,{
					transform:'rotate(90) translate('+ y1 +',' + (axLeft+15) +')',
					textLength:wordLen
				});
				DD.css(txt,{
					fill:me.titleColor,
					fontSize:14
				});
				graphics.appendChild(txt);
				
			}
			//用polyline绘制坐标轴
			axis = DD.newSvgEl('polyline');
			DD.attr(axis,{
				points:points,
				stroke:me.titleColor,
				'stroke-width':1,
				'marker-end':'url(#$chart_arrow)'
			});
			graphics.appendChild(axis);
		}
		/**
		 * 计算刻度间隔值
		 * @param min 	最小值
		 * @param max  	最大值
		 * @return 		刻度数组
		 */
		function cacScale(min,max){
			//刻度最大数量
			var maxCnt=7;
			var bs = 1;
			var plus = 1;
			var base = max-min;
			//base 控制在20-100之间
			if(base>100){
				for(;base>100;){
					base/=10;
					bs *= 10;
				}
			}
			if(base < 10){
				base *= 10;
				bs /= 10;
			}
			var v1 = 1;
			if(base >= 20){
				base /= 5;
				v1 = 5;
			}
			for(;base>maxCnt;base/=2,plus*=2);
			var per = v1*plus*bs;
			var arr = [];
			var cnt = (min/per)|0;
			var startIndex;
			var len = Math.ceil((max-min)/per);
			if(min === 0){
				startIndex = 1;
				len--;
			}else if(min<0){
				startIndex = Math.floor(min/per);
				if(max % per){
					len = len+1;	
				}
			}else{
				startIndex = Math.floor(min/per);
			}
			for(var i=startIndex,len=len+startIndex;i<=len;i++){
				arr.push(per * i);
			}
			return  arr;
		}
	}

	/**
	 * 绘制曲线
	 */
	Chart.prototype.drawLine = function(){
		var me = this;
		me.initData();

		if(me.title){
			me.drawTitle();
		}
		
		if(me.legend){
			me.drawLegend();
		}
		//初始化marker
		me.markers = initDefs(me.svg,true);
		me.drawAxes();
		
		var graphics = DD.newSvgEl('g');
		DD.attr(graphics,{
			transform:'translate(' + DrawArea.left + ',' + DrawArea.top + ')'
		});
		me.svg.appendChild(graphics);

		var width = DrawArea.width;
		var height = DrawArea.height;

		//每个宽度像素
		var px = me.scaleValues.x.px;
		var py = me.scaleValues.y.px;

		var px1,py1;	//单位值像素值
		var disx = 0;
		var tx = 2;  //x轴字符串
		var ty = 2;  //y轴字符串
		var minx = me.scaleValues.x.values[0];
		var miny = me.scaleValues.y.values[0];
		//如果为数字，则需要计算值和像素的兑换
		if(me.category[0] === 'number'){
			var vs = me.scaleValues.x.values;
			disx = vs[vs.length-1] - vs[0];
			// 每个值多少像素
			px1 =  px * (vs.length-1) / disx;
			tx = 1;
		}
		//如果为数字，则需要计算值和像素的兑换
		var disy = 0;
		if(me.category[1] === 'number'){
			var vs = me.scaleValues.y.values;
			disy = vs[vs.length-1] - vs[0];
			// 每个值多少像素
			py1 =  py * (vs.length-1) / disy;
			ty = 1;
		}

		var maxLen = 0;
		for(i=0;i<me.data.length;i++){
			if(me.data[i].datas.length>maxLen){
				maxLen = me.data[i].datas.length;
			}
		}
		for(var i=0;i<me.data.length;i++){
			var rows = me.data[i].datas;
			var line = DD.newSvgEl('path');
			graphics.appendChild(line);
			var color = getColor(me,i);
			DD.attr(line,{
				stroke:color,
				'stroke-width':2,
				fill:'none'
			});
			var d = '';
			for(var j=0;j<rows.length;j++){
				var da = rows[j];
				if(da){
					var x,y;
					if(tx === 1){ //数字
						x = (da.x-minx) * px1
						if(me.scaleValues.x.values[0] !== 0){
							x += px;	
						}
					}else{
						//x不存在，不添加此点
						var v = me.scaleValues.x.values.indexOf(da.x);
						if(v === -1){
							continue;
						}
						x = v * px + px;
					}
					if(ty === 1){
						y = height - (da.y - miny) * py1;
						if(miny !== 0){
							y -= py;	
						}
					}else{
						y = me.scaleValues.y.values.indexOf(da.y) * py - py;	
					}
					if(j===0){
						d += 'M' + x + ' ' + y;
					}else{
						d += ' L' + x + ' ' + y;
					}
				}
			}
			var config = {
				d:d
			};
			
			//添加marker
			if(me.marker){
				var mk = "url('#" + getMarker(i,color) + "')";
				config = {
					d:d,
					'marker-start':mk,
					'marker-mid':mk,
					'marker-end':mk
				}
			}
			DD.attr(line,config);
		}

		/**
		 * 获取marker
		 * @param index 	marker index
		 */
		function getMarker(index,color){

			var marker = me.markers[index % me.markers.length];
			if(index >= me.markers.length){
				var m1 = marker.m.cloneNode(true);
				var id = marker.id + '1';
				me.svg.querySelector('defs').appendChild(m1);
				DD.attr(m1,{
					id:id
				});
				var ma = {
					id:id,
					m:m1
				};
				//新创建的marker入库
				me.markers.push(ma);
				marker = ma; 
			}
			//设置marker颜色
			DD.attr(marker.m,{
				fill:color,
				stroke:color
			});
			
			return marker.id;
		}	
	}

	/**
	 * 绘制直方图
	 */
	Chart.prototype.drawHistogram = function(){
		var me = this;

		initDefs(me.svg,false);
		me.initData();

		if(me.title){
			me.drawTitle();
		}
		if(me.legend){
			me.drawLegend();
		}
		me.drawAxes(1);
		
		var graphics = DD.newSvgEl('g');
		DD.attr(graphics,{
			transform:'translate(' + DrawArea.left + ',' + DrawArea.top + ')'
		});
		me.svg.appendChild(graphics);

		var width = DrawArea.width;
		var height = DrawArea.height;
		//每个宽度像素
		var px = me.scaleValues.x.px;
		var py = me.scaleValues.y.px;
		
		//计算每个柱状图宽度
		var maxWidth = 40;
		//每个刻度宽度
		var pwidth = px;
		var histoWidth = (pwidth-10)/me.data.length;
		var pstart = 5;
		if(histoWidth>maxWidth){
			histoWidth = maxWidth;
			pstart = (pwidth - histoWidth*me.data.length)/2+5;
		}
		var tx=0,ty=0;
		var px1,py1;	//单位值像素值
		var minx = me.scaleValues.x.values[0];
		var miny = me.scaleValues.y.values[0];
		var maxx = me.scaleValues.x.values[me.scaleValues.x.values.length-1];
		var maxy = me.scaleValues.y.values[me.scaleValues.y.values.length-1];
		
		//如果为数字，则需要计算值和像素的兑换
		var disx = 0;
		if(me.category[0] === 'number'){
			var vs = me.scaleValues.x.values;
			disx = maxx - minx;
			// 每个值多少像素
			px1 =  px * (vs.length-1) / disx;
			tx = 1;
		}
		//如果为数字，则需要计算值和像素的兑换
		var disy = 0;
		if(me.category[1] === 'number'){
			var vs = me.scaleValues.y.values;
			disy = maxy-miny;
			// 每个值多少像素
			py1 =  py * (vs.length-1) / disy;
			ty = 1;
		}

		for(var i=0;i<me.data.length;i++){
			var color = getColor(me.svg,i);
			var rows = me.data[i].datas;
			for(var j=0;j<rows.length;j++){
				var da = rows[j];
				var colIndex = j;
				if(da.x !== me.scaleValues.x.values[j]){
					colIndex = -1;
					for(var k=0;k<me.scaleValues.x.values.length;k++){
						if(da.x === me.scaleValues.x.values[k]){
							colIndex = k;
						}
					}
					if(colIndex === -1){
						continue;
					}
				}
				if(da){
					var x,y;
					x = histoWidth*i + pstart + colIndex*pwidth;
					if(ty === 1){
						y = DrawArea.height - (da.y - miny) * py1;
						if(miny !== 0){
							y -= py;	
						}
					}else{
						var v = me.scaleValues.y.values.indexOf(da.y);
						if(v === -1){
							continue;
						}
						y = v * py - py;	
					}
					var height = DrawArea.height - y;
					var rect = DD.newSvgEl('rect');
					graphics.appendChild(rect);
					DD.attr(rect,{
						fill:color,
						x:x,
						y:y,
						width:histoWidth,
						height:height
					});
					
				}
			}
		}	
	}
	/**
	 * 绘制pie
	 */
	Chart.prototype.drawPie = function(){
		var me = this;
		if(me.title){
			me.drawTitle();
		}
		if(me.legend){
			me.drawLegend();
		}
		var maxlen = 0;
		for(var i=0;i<me.data.length;i++){
			if(me.data[i].title.length>maxlen){
				maxlen = me.data[i].title.length;
			}
		}
		maxlen *= WORDLEN;
		var radius;
		var width = DrawArea.width;
		var height = DrawArea.height;
		var moL = 0;   //新的左边距
		var cx,cy;     //圆心坐标

		if(me.showText){
			var marginW = 50 + maxlen*2;
			var marginH = 60;
			if(width-marginW >= height-marginH){
				radius = (height-marginH)/2;
				DrawArea.left += width/2 - radius;
				DrawArea.top += marginH/2;
			}else{
				radius = (width-marginW)/2;
				DrawArea.top += height/2 - radius;
				DrawArea.left += marginW/2;
			}
		}else{
			if(width > height){
				radius = height/2;
				DrawArea.left += width/2 - radius;
			}else{
				radius = width/2;
				DrawArea.top += height/2 - radius;
			}
		}
		cx = radius;
		cy = radius;
		DrawArea.height = radius*2;
		DrawArea.width = radius * 2;

		var graphics = DD.newSvgEl('g');
		DD.attr(graphics,{
			transform:'translate('+ DrawArea.left + ',' +  DrawArea.top + ')',
		});
		me.svg.appendChild(graphics);

		var left = 0;
		var top = 0;
		
		var sum = 0;
		for(var i=0;i<me.data.length;i++){
			var data = me.data[i];
			sum += data.value;
		}
		
		//起点
		var startx = cx + radius;
		var starty = cy + radius;
		var startAng = 0;	//开始角度	
		var angle = 0;      //结束角度
		for(var i=0;i<me.data.length;i++){
			var data = me.data[i];
			var per = data.value/sum;
			startAng = angle;
			angle += (per * Math.PI * 2);
			drawPie(graphics,cx,cy,radius,startAng,angle,getColor(me.svg,i),data.title,me.showPercent,me.showText);
		}

		/**
		 * 绘制扇形区域
		 * @param g 		graphics
		 * @param cx		圆心x坐标
		 * @param cy		圆心y坐标
		 * @param r     	半径
		 * @param angle1 	开始角度
		 * @param angle2 	结束角度
		 * @param color 	颜色
		 * @param text 		文本
		 * @param pos 		文本显示位置 in 在pie内，out在pie外
		 */
		function drawPie(g,cx,cy,r,angle1,angle2,color,text,showPercent,showText){
			var x1 = cx + r * Math.cos(angle1);
			var y1 = cy - r * Math.sin(angle1);
			var x2 = cx + r * Math.cos(angle2);
			var y2 = cy - r * Math.sin(angle2);

			var d = 'M ' + x1 + ' ' + y1 + ' A ' + r  + ' ' + r + ' ,1,0,0, ' +	
					x2 + ' ' + y2 + ' L '  +  cx + ' ' + cy + ' Z';
			var path = DD.newSvgEl('path');
			DD.attr(path,{
				d:d,
				fill:color
			});

			g.appendChild(path);
			var ang = angle1 + (angle2 - angle1)/2;
			//显示百分比
			if(showPercent){
				//计算中心角
				var ang1 = ang * 180/Math.PI;
				//数字显示在pie内部
				//百分比
				var p = DD.newSvgEl('text');
				p.innerHTML = (Math.abs((angle2-angle1)*100/(Math.PI*2))).toFixed(2) + '%';
				var rotate = 0;
				var x0=cx+r-30-text.length*WORDLEN;
				var y0=cy+5;
				var rx = cx;
				var ry = cy;
				if(ang1>90 && ang1<270){
					x0=cx-r+30;
					y0=cy+5;
					ang1 = ang1-180;
				}
				
				DD.attr(p,{
					x:x0,
					y:y0,
					fill:'#fff',
					transform:'rotate('+ (-ang1) + ',' + rx +','+ ry +')'
				});
				g.appendChild(p);
			}	
			//显示每块的文本
			if(showText && text){
				var vlLen = 10; //水平线长度
				var xlLen = 20;  //斜线长度
				//斜线
				x1 = cx + r * Math.cos(ang);
				y1 = cy - r * Math.sin(ang);
				x2 = cx + (r+xlLen) * Math.cos(ang);
				y2 = cy - (r+xlLen) * Math.sin(ang);
				var x3 =  x2;
				var txtX;
				var len1 = text.length * WORDLEN;
				//第2、3象限
				if(x3<cx){
					x3 -= vlLen;
					txtX = x3 - len1 - 5;
				}else{
					x3 += vlLen;
					txtX = x3+5;
				}
				var path = DD.newSvgEl('path');
				DD.attr(path,{
					d:'M' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2 + ' H ' + x3 + '',
					stroke:color,
					'stroke-width':1,
					fill:'none'
				});
				g.appendChild(path);

				//文本
				var t = DD.newSvgEl('text');
				t.innerHTML = text;
				DD.attr(t,{
					x:txtX,
					y:y2+5,
					fill:color
				});
				g.appendChild(t);
			}
		}
	}

	DD.Plugin.create('chart',Chart);
}());
/**
 * 消息框
 * @author yanglei
 * 
 */
(function(){
	/**
	 * 数据项配置说明
	 * 标题 title
	 * 内容 content
	 * 按钮 buttons:[{text:'按钮1'},{text:'按钮2'},...] 最多三个按钮
	 * 回调 callbacks:['method1','method2',...]，回调个数语按钮个数相同，回调也可以为空
	 * 模块 module 如果msgbox指令不在该module使用，需要设置
	 */
	var MessageBox = function(){
		
	}

	/**
	 * 插件初始化
	 */
	MessageBox.prototype.init = function(view){
		var me = this;
		
		var template = "<div class='nd-plugin-msgbox-mb'></div>" +
							"<div class='nd-plugin-msgbox-box'>" +
								"<div class='nd-plugin-msgbox-title'>{{title}}</div>" +
								"<div class='nd-plugin-msgbox-content'>{{content}}</div>" +
								"<div class='nd-plugin-msgbox-btnct'>" +
									"<a class='nd-plugin-msgbox-btn' x-repeat='buttons'>{{text}}</a>" +
								"</div>" +
							"</div>" +
						"</div>";
		DD.addClass(view,'nd-plugin-msgbox');
		//显示字段，默认为show
		var show = DD.attr(view,'showItem') || 'show';
		//数据项名字
		me.dataName = DD.attr(view,'dataName');
		DD.attr(view,'x-show',show);
		view.$showItem = show;
		//移除showItem和dataName
		view.removeAttribute('showItem');
		view.removeAttribute('dataName');
		//设置innerHTML
		view.innerHTML = template;
		DD.Compiler.compile(view,view.$module);
	}

	/**
	 * 渲染时执行
	 */
	MessageBox.prototype.render = function(view){
		var me = this;
		var data = view.$getData().data;
		if(!data){
			return;
		}

		if(!data.buttons || !data.buttons.length){
			throw DD.Error.handle('invoke','msgbox','buttons','array');
		}
		//最多只能有三个按钮
		if(data.buttons && data.buttons.length>=3){
			data.buttons.splice(3,data.buttons.length);
		}
		var module;
		if(!data.module){
			module = view.$module;
		}else{
			module = data.module;
		}
		if(!module){
			return;
		}
		
		//可能内部节点还未渲染出来，需要延迟渲染
		setTimeout(delayRender,0);

		function delayRender(){
			//重新计算button的宽度
			var btns = view.querySelectorAll(".nd-plugin-msgbox-btn");

			//计算宽度百分比并取整
			var width = (100/data.buttons.length) | 0;
			var funcs = data.callbacks;   //回调函数
			for(var i=0;i<btns.length;i++){
				DD.css(btns[i],'width',width+'%');
				//清除事件
				DD.getOwnProps(btns[i].$events).forEach(function(ev){
					btns[i].$events[ev].unbind();
				});
				btns[i].$events = {};
				var func;
				//设置事件绑定
				if(funcs && funcs[i]){
					var cb = funcs[i];
					//如果存在此按钮对应回调函数，则先隐藏，再执行回调
					func = function(e,d,v){
						//隐藏msgbox
						data[view.$showItem] = false;
						var index = 0;
						for(var i=0;i<btns.length;i++){
							if(btns[i] === e.target){
								index = i;
								break;
							}
						}
						var foo = module.methodFactory.get(funcs[index]);
						
						if(DD.isFunction(foo)){
							foo.call(module.model,e,d,v);	
						}
					}
				}else{
					func = function(e,d,v){
						data[view.$showItem] = false;	
					}
				}
				//添加按钮事件
				new DD.Event({
					eventName:'click',
					view:btns[i],
					handler:func
				});
			}	
		}
	}

	DD.Plugin.create('msgbox',MessageBox);	
}());
