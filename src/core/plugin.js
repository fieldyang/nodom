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