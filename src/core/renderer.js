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
				//如果没渲染成功，则追加到最后，等待下次渲染
				me.waitList.splice(i--,1);
				m.render();
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
