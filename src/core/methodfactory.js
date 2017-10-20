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