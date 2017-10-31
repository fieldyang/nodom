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
