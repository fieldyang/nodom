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