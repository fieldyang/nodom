/**
 * 系统配置
 * 1.配置app路径
 * 2.配置app view  路径
 * 3.配置app model 路径
 * 4.配置app viewmodel 路径
 */

DD.config = {
	renderTick:50,			//渲染时间间隔
    appPath:'',				//应用加载默认路径,
    deviceType:'ontouchend' in document?1:2		    //设备类型  1:触屏，2:pc	
};

