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
        
        if(!view.$validity){
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