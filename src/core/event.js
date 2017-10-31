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