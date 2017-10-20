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
