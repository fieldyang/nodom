/**
 * @description 异常处理类
 * @author      yanglei
 * @since       1.0.0
 */

DD.Error = {
   /**
    * 按照消息编号进行处理并返回消息内容
    * @param 异常名
    * @param args1,args2,args3,... 待替换的参数
    * @return 转换后的消息
    */
   
   handle:function(errname){
      var reg = new RegExp(/\{.+?\}/);
      
      var msg = DD.ErrorMsgs[errname];
      if(msg === undefined){
        return "未知错误";
      }
      var args = [msg];
      for(var i=1;i<arguments.length;i++){
        args.push(arguments[i]);
      }
      return DD.compileStr.apply(DD,args);
   }
};