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
		waitList : [], 		  	//待渲染列表
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
		 * @param view 		待渲染的视图
		 * @param module 	模块
		 * @return 			true/false
		 */
		renderView:function(view,module){
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
