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
 ß*/

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
		 * @param force  	强制终止当前路由链，默认false
		 */
		start:function(path,forward,replace,force){
			var me = this;
			path = path.trim();
			if(DD.isEmpty(path)){
				return;
			}
			if(me.currentPath === path){
				return true;
			}
			if(forward === undefined){
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
						r.onLeave();
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
				me.currentState = {path:path,index:me.history++,forward:true};
				//替换当前历史
				if(replace){
					history.replaceState(me.currentState,'', getAbsPath(path));
				}else{
					history.pushState(me.currentState,'', getAbsPath(path));	
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
				me.onEnter(me.module);
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
			oroute = DD.get("[role='activeroute']",false,pview);
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