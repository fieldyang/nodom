'use strict';
(function(){
	var LEGENDWORDLEN = 12;					//legend字符宽度
	var WORDLEN = 10;						//普通字符宽度
	var TITLEWORDLEN = 18;					//图表标题字符宽度
	var TITLEHEIGHT=30;						//title高度
	var SPACELEN = 30;						//坐标轴多余数据宽度
	var DrawArea = {						//绘制区域
		left:0,
		top:0
	};
	var DEFAULTS = {
		type:'line',					//图表类型
		dataName:undefined,				//绑定数据名
		width:400,						//宽度
		height:600,						//高度
		bgColor:'#fff',					//背景色
		margins:[40,40,20,20],			//margin
		category:['number','number'],	//x,y轴数据类型
		title:undefined,				//主标题
		xTitle:undefined, 				//x轴标题
		yTitle:undefined,				//y轴标题
		legend:undefined,				//legend显示位置
		titleColor:'#000',				//标题和刻度文字颜色
		colors:undefined,				//线条或pie颜色
		fixedCnt:[0,0],					//小数位数
		marker:false,					//曲线中显示marker
		showPercent:false,				//显示百分比
		showText:false,					//显示文本线
		gridLine:0,						//网格线 1横线 2竖线 3全部
		gridLineColor:'#ccc'            //网格线颜色
	};

	/**
	 * @param config
	 *			el: 	element selector
	 * 			module: 模块
	 * 			model: 	模型 		
	 */
	var Chart = function(config){
	
	}


	/**
	 * 初始化方法
	 */
	Chart.prototype.init = function(view){
		var me = this;
		
		me.view = view;
		me.svg = DD.newSvgEl('svg');
		view.appendChild(me.svg);
		DD.attr(me.svg,{
			width:'100%',
			height:'100%'
		});
		DD.css(me.svg,{
			fontSize:12,
			background:me.bgColor
		});
	}

	/**
	 * 渲染方法
	 */
	Chart.prototype.render = function(view){
		var me = this;

		var obj = getConfig(view,DEFAULTS);
		//如果没有设置width和height，则需要从view获取
		if(!obj.width || !obj.height){
			var width = DD.width(view);
			//存在渲染延时问题，延迟再获取width和height
			if(!width){
				setTimeout(function(){
					me.render(view);
				},50);
				return;
			}
			obj.width = width;
			obj.height = DD.height(view);
		}
		
		DD.extend(me,DEFAULTS,obj);
		me.view = view;
		me.svg = me.view.children[0];
		DD.attr(me.svg,{
			width:me.width,
			height:me.height
		});
		
		DD.empty(me.svg);
		//获取数据
		var model = view.$getData();
		me.data = model.data;

		if(me.dataName){
			me.data = me.data[me.dataName];
		}
		if(!me.data){
			return;
		}

		//设置绘图区域
		DrawArea = {
			top: me.margins[0],
			left: me.margins[3],
			width:me.width - me.margins[1] - me.margins[3],
			height:me.height - me.margins[0] - me.margins[2]	
		}

		switch(me.type){
			case 'line':
				me.drawLine();
				break;
			case 'histogram':
				me.drawHistogram();
				break;
			case 'pie':
				me.drawPie();
				break;
		}
	}


	/**
	 * 获取颜色
	 * @param chart 	图表对象
	 * @param index 	颜色索引
	 */
	function getColor(chart,index){
		var colors = [[179,33,38],[36,53,66],[80,142,150],[200,109,82],[129,188,158]]
		// 如果有用户自定义颜色，则直接取
		if(chart.colors && chart.colors.length>index){
			return chart.colors[index];
		}else{
			var r,g,b;
			//0-4 号索引，取colors数组
			if(index<5){
				var ar = colors[index];
				r = ar[0];
				g = ar[1];
				b = ar[2];
			}else{ //>=5，以基色生成
				var ind1 = (index/5)|0;
				var ind2 = index%5;
				var ar = colors[ind2];
				r = ar[0] + 30*ind1;
				g = ar[1] + 30*ind1;
				b = ar[2] + 30*ind1;
				if(r > 255){
					r = r%255;
				}
				if(g > 255){
					g = g%255;
				}
				if(b > 255){
					b = g%255;
				}
			}
			return 'rgb(' + r + ',' + g + ',' + b + ')';
		}
	}

	/**
	 * 获取配置
	 * @param el 	element
	 * @param obj 	default 参数 
	 */
	function getConfig(el,obj){
		var arrs = ['margins','colors','fixedCnt','category'];
		var numbers = ['margins','width','height','gridLine','fixedCnt'];
		var obj1 = {};
		DD.getOwnProps(obj).forEach(function(pn){
			var attr = DD.attr(el,pn.toLowerCase());
			if(attr){
				if(!attr){
					return;
				}
				var pv = attr.trim();
				//是否数组标志
				var isArr = false;
				//数组
				if(arrs.indexOf(pn) !== -1){
					pv = pv.split(',');
					isArr = true;
				}
				//数值需要进行数据类型转换
				if(numbers.indexOf(pn) !== -1){
					if(isArr){
						pv.forEach(function(v,i){
							try{
								pv[i] = eval(v);
							}catch(e){}
						});
					}else{
						try{
							pv = eval(pv);	
						}catch(e){}
						
					}
				}
				//bool型处理
				if(pv === 'true' || pv === 'false'){
					pv = eval(pv);
				}

				obj1[pn] = pv;
				// el.removeAttribute(pn);
			}
		});
		return obj1;
	}

	/**
	 * 初始化marker
	 * @param flag  是否初始化折线marker，默认false
	 * @return 		markers
	 */
	//初始化defs
	function initDefs(svg,flag){
		var defs = DD.newSvgEl('defs');
		
		svg.appendChild(defs);

		//坐标轴箭头
		var arrow = DD.newSvgEl('marker');
		DD.attr(arrow,{
			id:'$chart_arrow',
			viewBox:'0 0 10 10',
			refX:1,
			refY:5,
			markerWidth:6,
			markerHeight:6,
			orient:'auto'
		});
		var path = DD.newSvgEl('path');
		DD.attr(path,{
			d:'M 0 0 L 10 5 L 0 10 z'
		});
		arrow.appendChild(path);
		defs.appendChild(arrow);
		
		if(!flag){
			return;
		}

		//圆圈
		var circle = DD.newSvgEl('marker');
		DD.attr(circle,{
			id:'$chart_circle',
			refX:3,
			refY:3,
			markerWidth:8,
			markerHeight:8,
			orient:'auto'
		});
		var c = DD.newSvgEl('circle');
		DD.attr(c,{
			cx:3,
			cy:3,
			r:1.5
		});
		circle.appendChild(c);
		defs.appendChild(circle);
		
		//三角形
		var tri = DD.newSvgEl('marker');
		DD.attr(tri,{
			id:'$chart_tri',
			viewBox:[0,0,20,20],
			refX:5,
			refY:6,
			markerWidth:9,
			markerHeight:9,
			orient:'auto'
		});
		var c = DD.newSvgEl('polygon');
		DD.attr(c,{
			points:'0,10 5,3 10,10'
		});
		tri.appendChild(c);
		defs.appendChild(tri);

		//方形
		var rect = DD.newSvgEl('marker');
		DD.attr(rect,{
			id:'$chart_rect',
			refX:2,
			refY:2,
			markerWidth:5,
			markerHeight:5,
			orient:'auto'
		});
		var r = DD.newSvgEl('rect');
		DD.attr(r,{
			x:0,
			y:0,
			width:3,
			height:3
		});
		rect.appendChild(r);
		defs.appendChild(rect);
		
		//叉
		var cross = DD.newSvgEl('marker');
		DD.attr(cross,{
			id:'$chart_cross',
			viewBox:[0,0,10,10],
			refX:3,
			refY:3,
			markerWidth:6,
			markerHeight:6,
			orient:'auto',
			stroke:'black'
		});
		var p = DD.newSvgEl('path');
		DD.attr(p,{
			d:'M0 0 L6 6 M0 6 L6 0 Z',
			'stroke-width':2,
			fill:'none',
		});
		cross.appendChild(p);
		defs.appendChild(cross);
		//五角星
		var star = DD.newSvgEl('marker');
		DD.attr(star,{
			id:'$chart_star',
			viewBox:[0,0,35,35],
			refX:7,
			refY:7,
			markerWidth:15,
			markerHeight:15,
			orient:'auto',
			stroke:'black'
		});
		var p = DD.newSvgEl('path');
		DD.attr(p,{
			d:'m0.75,5.385069l4.20154,0l1.29846,-4.201666l1.29846,4.201666l4.20154,0l-3.399233,2.596676l1.298462,4.201661l-3.399229,-2.596801l-3.399227,2.596801l1.29846,-4.201661l-3.399233,-2.596676l0,0z',
			'stroke-width':1
		});
		star.appendChild(p);
		defs.appendChild(star);
		var markers = [];
		markers.push({id:'$chart_circle',m:circle});
		markers.push({id:'$chart_tri',m:tri});
		markers.push({id:'$chart_rect',m:rect});
		markers.push({id:'$chart_star',m:star});
		markers.push({id:'$chart_cross',m:cross});
		return markers;
	}

	/**
	 * 初始化数据，排序并设置xy轴类型number 和 string
	 */
	Chart.prototype.initData = function(){
		var me = this;
		//数据排序并查找最大x，y
		var minx,maxx,miny,maxy;
		var xValues =[],yValues = [];   //存放非number的xy值
		for(var ii=0;ii<me.data.length;ii++){
			var d = me.data[ii];
			d.datas.sort(function(a,b){
				return a.x - b.x;
			});
			//设置默认title
			if(!d.title){
				d.title = '数据' + ii;
			}
			//查找最大最小xy或设置xvalues，yvalues
			for(var i=0;i<d.datas.length;i++){
				var d1 = d.datas[i];
				if(me.category[0] === 'number'){
					if(!minx || d1.x<minx){
						minx = d1.x;
					}
					if(!maxx || d1.x>maxx){
						maxx = d1.x;
					}	
				}else{
					if(xValues.indexOf(d1.x) === -1){
						xValues.push(d1.x);
					}
				}
				
				if(me.category[1] === 'number'){
					if(!miny || d1.y<miny){
						miny = d1.y;
					}
					if(!maxy || d1.y>maxy){
						maxy = d1.y;
					}
				}else{
					d1.y += '';
					if(yValues.indexOf(d1.y) === -1){
						yValues.push(d1.y);
					}
				}
			}	
		}
		if(xValues.length > 0){
			xValues.sort();
		}
		if(yValues.length>0){
			yValues.sort();
		}

		me.dataArea = {
			minx:minx,
			maxx:maxx,
			miny:miny,
			maxy:maxy,
			xValues:xValues,
			yValues:yValues
		};
	}
	/**
	 * 绘制title
	 */
	Chart.prototype.drawTitle = function(){
		var me = this;
		if(!me.title){
			return;
		}
		var title = me.title;
		var len = title.length*TITLEWORDLEN;
		var l = (DrawArea.width - len)/2;
		var t = me.margins[0];
		var text = DD.newSvgEl('text');
		text.innerHTML = title;
		DD.attr(text,{
			transform:'translate(' + l + ',' + t + ')',
			fill:me.titleColor,
			'font-size':18,
			textLength:len
		});
		me.svg.appendChild(text);
		//修改drawArea
		DrawArea.top += TITLEHEIGHT;
		DrawArea.height -= TITLEHEIGHT;

	}

	/**
	 * 绘制legend
	 */
	Chart.prototype.drawLegend = function(){
		var me = this;
		if(me.legend !== 'top' && me.legend !== 'bottom' && me.legend !== 'right'){
			return;
		}
		//计算最长legendword
		var maxlen = 0;
		for(var i=0;i<me.data.length;i++){
			if(me.data[i].title.length > maxlen){
				maxlen = me.data[i].title.length;
			}
		}

		var legendLength = 50+maxlen*WORDLEN;
		var legendCnt = me.data.length;
		var legendHeight = 40;
		var left,top,width,height;
		var dwidth = DrawArea.width; //可绘制区宽度
		// 根据不同类型设置不同宽高并修改DrawArea

		switch(me.legend){
			case 'top':
				top = DrawArea.top;
				//一行放不下
				if(legendCnt * legendLength > dwidth){
					width = dwidth;
					left = DrawArea.left;
					var rows = Math.ceil(legendCnt * legendLength/dwidth);
					height = legendHeight*rows;
				}else{
					width = legendCnt * legendLength;
					height = legendHeight;
					left = (DrawArea.width - width)/2 + DrawArea.left;
				}
				DrawArea.top += height;
				DrawArea.height -= height;
				break;
			case 'right':
				width = legendLength-25;
				height = legendHeight * legendCnt;
				top = DrawArea.top;
				left = DrawArea.left + DrawArea.width - width;
				DrawArea.width -= width;
				break;
			case 'bottom':
				//一行放不下
				if(legendCnt * legendLength > dwidth){
					width = dwidth;
					left = DrawArea.left;
					var rows = Math.ceil(legendCnt * legendLength/dwidth);
					height = legendHeight*rows;
				}else{
					width = legendCnt * legendLength;
					height = legendHeight;
					left = (DrawArea.width - width)/2 + DrawArea.left;
				}
				top = DrawArea.top + DrawArea.height - height;
				DrawArea.height -= height;
		}
		var graphics = DD.newSvgEl('g');
		DD.attr(graphics,{
			transform:'translate(' + left + ',' + top + ')'
		});
		var x = 0;
		var y = 10;
		for(var i=0;i<me.data.length;i++){
			var color = getColor(me,i);
			//绘制矩形
			var rect = DD.newSvgEl('rect');
			DD.attr(rect,{
				x:x,
				y:y,
				rx:5,
				ry:5,
				fill:color,
				width:30,
				height:15
			});
			graphics.appendChild(rect);
			//文字
			var title = me.data[i].title;
			var text = DD.newSvgEl('text');
			text.innerHTML = title;
			DD.attr(text,{
				x:x+35,
				y:y+12,
				fill:color
			});
			DD.css(text,'fontSize',14);
			graphics.appendChild(text);
			if(x + 2*legendLength <= width){
				x += legendLength;
			}else{
				x = 0;
				y += legendHeight;
			}
		}
		me.svg.appendChild(graphics);
	}

	/**
	 * 绘制坐标轴
	 * @param flag 	柱状图坐标
	 */
	Chart.prototype.drawAxes = function(flag){
		var me = this;
		
		//纵坐标文本宽度
		var axLeft = me.category[1]==='number'?(me.dataArea.maxy+'').length:me.dataArea.yValues[0].length;
		axLeft = axLeft * WORDLEN + 20;
		var axBottom = 30;    //横坐标文本高度
 		var left1 = (me.yTitle?10:0) + axLeft;
 		DrawArea.top += SPACELEN;
		
		DrawArea.height -= SPACELEN+(me.xTitle?25:0) + axBottom;
		DrawArea.width -= left1 + SPACELEN+5;
		DrawArea.left += left1;
		

		var width = DrawArea.width;
		var height = DrawArea.height;

		var valueX = me.category[0]==='number'?cacScale(me.dataArea.minx,me.dataArea.maxx):me.dataArea.xValues;
		var valueY = me.category[1]==='number'?cacScale(me.dataArea.miny,me.dataArea.maxy):me.dataArea.yValues;

		//设置全局scaleValue
		var xLen = valueX.length;
		var yLen = valueY.length;
		//0 开始，少一个刻度
		if(valueX[0] === 0){
			xLen--;
		}
		if(valueY[0] === 0){
			yLen--;
		}
		me.scaleValues = {
			x:{
				values:valueX,
				px:width/xLen
			},
			y:{
				values:valueY,
				px:height/yLen
			}
		}
		var graphics = DD.newSvgEl('g');
		DD.attr(graphics,{
			transform:'translate(' + DrawArea.left + ',' + DrawArea.top + ')'
		});
		me.svg.appendChild(graphics);
		drawAxis();

		function drawAxis(){
			var points = '';
			//计算并绘制x轴
			var x=0;
			var y=DrawArea.height;

			var values = me.scaleValues.x.values;
			var px =  me.scaleValues.x.px;
			var len = values[0] === 0?values.length-1:values.length;
			for(var i=0;i<=len;i++,x+=px){
				//处理小数位数
				if(x%1){
				 	x=parseFloat(x.toFixed(me.fixedCnt));
				}
				points += x + ',' + y + ' ';
				//竖线
				if(i>0){
					points += x + ',' + (y-5) + ' ' + x + ',' + y + ' ';
					//网格线
					if(me.gridLine === 2 || me.gridLine === 3){
						var gl = DD.newSvgEl('path');
						DD.attr(gl,{
							d:'M' + x + ' ' + y + ' V 0',
							stroke:me.gridLineColor,
							'stroke-width':1
						});
						graphics.appendChild(gl);
					}

				}
				//x坐标文本
				if(i>0){
					var text = DD.newSvgEl('text');
					var tlen = (values[i-1]+'').length*WORDLEN;
					var l;
					//柱状图
					if(flag === 1 && me.category[0] === 'string'){
						l = (px-tlen)/2 + (i-1) * px;
					}else{
						l = x - tlen/2;
					}
					DD.attr(text,{
						x:l,
						y:y + 20
					});
					DD.css(text,{
						fill:me.titleColor,
						strokeWidth:0
					});
					var ind = values[0] === 0? i:i-1;
					text.innerHTML = values[ind];
					graphics.appendChild(text);	
				}
				
			}
			points += (x - px + SPACELEN) + ',' + y;
			//写xtitle
			if(me.xTitle){
				var txt = DD.newSvgEl('text');
				txt.innerHTML = me.xTitle;
				graphics.appendChild(txt);
				DD.attr(txt,{
					x:(DrawArea.width - me.xTitle.length*12)/2,
					y:y+50
				});
				DD.css(txt,{
					fill:me.titleColor,
					fontSize:14
				});
			}

			//用polyline绘制坐标轴
			var axis = DD.newSvgEl('polyline');
			DD.attr(axis,{
				points:points,
				stroke:me.titleColor,
				'stroke-width':1,
				'marker-end':'url(#$chart_arrow)'
			});
			graphics.appendChild(axis);

			//计算并绘制y轴
			x = 0;
			y = DrawArea.height;
			values = me.scaleValues.y.values;
			px =  me.scaleValues.y.px;
			points = '';
			var len = values[0] === 0?values.length-1:values.length;
			for(var i=0;i<=len;i++,y-=px){
				if(y%1){
					y=parseFloat(y.toFixed(me.fixedCnt[0]));
				}

				points += x + ',' + y + ' ';
				//横线
				if(i>0){
					points += (x+5) + ',' + y + ' ' + x + ',' + y + ' ';
					//网格线
					if(me.gridLine === 1 || me.gridLine === 3){
						var gl = DD.newSvgEl('path');
						DD.attr(gl,{
							d:'M' + x + ' ' + y + ' H ' + (DrawArea.width),
							stroke:me.gridLineColor,
							'stroke-width':1
						});
						graphics.appendChild(gl);
					}
				}

				//刻度文本
				if(i>0){
					var text = DD.newSvgEl('text');
					DD.attr(text,{
						x:x - (values[i-1]+'').length*WORDLEN - 10,
						y:y+4
					});
					DD.css(text,{
						fill:me.titleColor,
						strokeWidth:0
					});
					var ind = values[0] === 0? i:i-1;
					text.innerHTML = values[ind];
					graphics.appendChild(text);
				}
			}
			points += x + ',' + (y + px - SPACELEN);
			//写ytitle
			if(me.yTitle){
				var txt = DD.newSvgEl('text');
				txt.innerHTML = me.yTitle;
				var wordLen = me.yTitle.length*12;
				var y1 = (DrawArea.height - wordLen)/2-20;

				DD.attr(txt,{
					transform:'rotate(90) translate('+ y1 +',' + (axLeft+15) +')',
					textLength:wordLen
				});
				DD.css(txt,{
					fill:me.titleColor,
					fontSize:14
				});
				graphics.appendChild(txt);
				
			}
			//用polyline绘制坐标轴
			axis = DD.newSvgEl('polyline');
			DD.attr(axis,{
				points:points,
				stroke:me.titleColor,
				'stroke-width':1,
				'marker-end':'url(#$chart_arrow)'
			});
			graphics.appendChild(axis);
		}
		/**
		 * 计算刻度间隔值
		 * @param min 	最小值
		 * @param max  	最大值
		 * @return 		刻度数组
		 */
		function cacScale(min,max){
			//刻度最大数量
			var maxCnt=7;
			var bs = 1;
			var plus = 1;
			var base = max-min;
			//base 控制在20-100之间
			if(base>100){
				for(;base>100;){
					base/=10;
					bs *= 10;
				}
			}
			if(base < 10){
				base *= 10;
				bs /= 10;
			}
			var v1 = 1;
			if(base >= 20){
				base /= 5;
				v1 = 5;
			}
			for(;base>maxCnt;base/=2,plus*=2);
			var per = v1*plus*bs;
			var arr = [];
			var cnt = (min/per)|0;
			var startIndex;
			var len = Math.ceil((max-min)/per);
			if(min === 0){
				startIndex = 1;
				len--;
			}else if(min<0){
				startIndex = Math.floor(min/per);
				if(max % per){
					len = len+1;	
				}
			}else{
				startIndex = Math.floor(min/per);
			}
			for(var i=startIndex,len=len+startIndex;i<=len;i++){
				arr.push(per * i);
			}
			return  arr;
		}
	}

	/**
	 * 绘制曲线
	 */
	Chart.prototype.drawLine = function(){
		var me = this;
		me.initData();

		if(me.title){
			me.drawTitle();
		}
		
		if(me.legend){
			me.drawLegend();
		}
		//初始化marker
		me.markers = initDefs(me.svg,true);
		me.drawAxes();
		
		var graphics = DD.newSvgEl('g');
		DD.attr(graphics,{
			transform:'translate(' + DrawArea.left + ',' + DrawArea.top + ')'
		});
		me.svg.appendChild(graphics);

		var width = DrawArea.width;
		var height = DrawArea.height;

		//每个宽度像素
		var px = me.scaleValues.x.px;
		var py = me.scaleValues.y.px;

		var px1,py1;	//单位值像素值
		var disx = 0;
		var tx = 2;  //x轴字符串
		var ty = 2;  //y轴字符串
		var minx = me.scaleValues.x.values[0];
		var miny = me.scaleValues.y.values[0];
		//如果为数字，则需要计算值和像素的兑换
		if(me.category[0] === 'number'){
			var vs = me.scaleValues.x.values;
			disx = vs[vs.length-1] - vs[0];
			// 每个值多少像素
			px1 =  px * (vs.length-1) / disx;
			tx = 1;
		}
		//如果为数字，则需要计算值和像素的兑换
		var disy = 0;
		if(me.category[1] === 'number'){
			var vs = me.scaleValues.y.values;
			disy = vs[vs.length-1] - vs[0];
			// 每个值多少像素
			py1 =  py * (vs.length-1) / disy;
			ty = 1;
		}

		var maxLen = 0;
		for(i=0;i<me.data.length;i++){
			if(me.data[i].datas.length>maxLen){
				maxLen = me.data[i].datas.length;
			}
		}
		for(var i=0;i<me.data.length;i++){
			var rows = me.data[i].datas;
			var line = DD.newSvgEl('path');
			graphics.appendChild(line);
			var color = getColor(me,i);
			DD.attr(line,{
				stroke:color,
				'stroke-width':2,
				fill:'none'
			});
			var d = '';
			for(var j=0;j<rows.length;j++){
				var da = rows[j];
				if(da){
					var x,y;
					if(tx === 1){ //数字
						x = (da.x-minx) * px1
						if(me.scaleValues.x.values[0] !== 0){
							x += px;	
						}
					}else{
						//x不存在，不添加此点
						var v = me.scaleValues.x.values.indexOf(da.x);
						if(v === -1){
							continue;
						}
						x = v * px + px;
					}
					if(ty === 1){
						y = height - (da.y - miny) * py1;
						if(miny !== 0){
							y -= py;	
						}
					}else{
						y = me.scaleValues.y.values.indexOf(da.y) * py - py;	
					}
					if(j===0){
						d += 'M' + x + ' ' + y;
					}else{
						d += ' L' + x + ' ' + y;
					}
				}
			}
			var config = {
				d:d
			};
			
			//添加marker
			if(me.marker){
				var mk = "url('#" + getMarker(i,color) + "')";
				config = {
					d:d,
					'marker-start':mk,
					'marker-mid':mk,
					'marker-end':mk
				}
			}
			DD.attr(line,config);
		}

		/**
		 * 获取marker
		 * @param index 	marker index
		 */
		function getMarker(index,color){

			var marker = me.markers[index % me.markers.length];
			if(index >= me.markers.length){
				var m1 = marker.m.cloneNode(true);
				var id = marker.id + '1';
				me.svg.querySelector('defs').appendChild(m1);
				DD.attr(m1,{
					id:id
				});
				var ma = {
					id:id,
					m:m1
				};
				//新创建的marker入库
				me.markers.push(ma);
				marker = ma; 
			}
			//设置marker颜色
			DD.attr(marker.m,{
				fill:color,
				stroke:color
			});
			
			return marker.id;
		}	
	}

	/**
	 * 绘制直方图
	 */
	Chart.prototype.drawHistogram = function(){
		var me = this;

		initDefs(me.svg,false);
		me.initData();

		if(me.title){
			me.drawTitle();
		}
		if(me.legend){
			me.drawLegend();
		}
		me.drawAxes(1);
		
		var graphics = DD.newSvgEl('g');
		DD.attr(graphics,{
			transform:'translate(' + DrawArea.left + ',' + DrawArea.top + ')'
		});
		me.svg.appendChild(graphics);

		var width = DrawArea.width;
		var height = DrawArea.height;
		//每个宽度像素
		var px = me.scaleValues.x.px;
		var py = me.scaleValues.y.px;
		
		//计算每个柱状图宽度
		var maxWidth = 40;
		//每个刻度宽度
		var pwidth = px;
		var histoWidth = (pwidth-10)/me.data.length;
		var pstart = 5;
		if(histoWidth>maxWidth){
			histoWidth = maxWidth;
			pstart = (pwidth - histoWidth*me.data.length)/2+5;
		}
		var tx=0,ty=0;
		var px1,py1;	//单位值像素值
		var minx = me.scaleValues.x.values[0];
		var miny = me.scaleValues.y.values[0];
		var maxx = me.scaleValues.x.values[me.scaleValues.x.values.length-1];
		var maxy = me.scaleValues.y.values[me.scaleValues.y.values.length-1];
		
		//如果为数字，则需要计算值和像素的兑换
		if(me.category[0] === 'number'){
			var vs = me.scaleValues.x.values;
			disx = maxx - minx;
			// 每个值多少像素
			px1 =  px * (vs.length-1) / disx;
			tx = 1;
		}
		//如果为数字，则需要计算值和像素的兑换
		var disy = 0;
		if(me.category[1] === 'number'){
			var vs = me.scaleValues.y.values;
			disy = maxy-miny;
			// 每个值多少像素
			py1 =  py * (vs.length-1) / disy;
			ty = 1;
		}

		for(var i=0;i<me.data.length;i++){
			var color = getColor(me.svg,i);
			var rows = me.data[i].datas;
			for(var j=0;j<rows.length;j++){
				var da = rows[j];
				var colIndex = j;
				if(da.x !== me.scaleValues.x.values[j]){
					colIndex = -1;
					for(var k=0;k<me.scaleValues.x.values.length;k++){
						if(da.x === me.scaleValues.x.values[k]){
							colIndex = k;
						}
					}
					if(colIndex === -1){
						continue;
					}
				}
				if(da){
					var x,y;
					x = histoWidth*i + pstart + colIndex*pwidth;
					if(ty === 1){
						y = DrawArea.height - (da.y - miny) * py1;
						if(miny !== 0){
							y -= py;	
						}
					}else{
						var v = me.scaleValues.y.values.indexOf(da.y);
						if(v === -1){
							continue;
						}
						y = v * py - py;	
					}
					var height = DrawArea.height - y;
					var rect = DD.newSvgEl('rect');
					graphics.appendChild(rect);
					DD.attr(rect,{
						fill:color,
						x:x,
						y:y,
						width:histoWidth,
						height:height
					});
					
				}
			}
		}	
	}
	/**
	 * 绘制pie
	 */
	Chart.prototype.drawPie = function(){
		var me = this;
		if(me.title){
			me.drawTitle();
		}
		if(me.legend){
			me.drawLegend();
		}
		var maxlen = 0;
		for(var i=0;i<me.data.length;i++){
			if(me.data[i].title.length>maxlen){
				maxlen = me.data[i].title.length;
			}
		}
		maxlen *= WORDLEN;
		var radius;
		var width = DrawArea.width;
		var height = DrawArea.height;
		var moL = 0;   //新的左边距
		var cx,cy;     //圆心坐标

		if(me.showText){
			var marginW = 50 + maxlen*2;
			var marginH = 60;
			if(width-marginW >= height-marginH){
				radius = (height-marginH)/2;
				DrawArea.left += width/2 - radius;
				DrawArea.top += marginH/2;
			}else{
				radius = (width-marginW)/2;
				DrawArea.top += height/2 - radius;
				DrawArea.left += marginW/2;
			}
		}else{
			if(width > height){
				radius = height/2;
				DrawArea.left += width/2 - radius;
			}else{
				radius = width/2;
				DrawArea.top += height/2 - radius;
			}
		}
		cx = radius;
		cy = radius;
		DrawArea.height = radius*2;
		DrawArea.width = radius * 2;

		var graphics = DD.newSvgEl('g');
		DD.attr(graphics,{
			transform:'translate('+ DrawArea.left + ',' +  DrawArea.top + ')',
		});
		me.svg.appendChild(graphics);

		var left = 0;
		var top = 0;
		
		var sum = 0;
		for(var i=0;i<me.data.length;i++){
			var data = me.data[i];
			sum += data.value;
		}
		
		//起点
		var startx = cx + radius;
		var starty = cy + radius;
		var startAng = 0;	//开始角度	
		var angle = 0;      //结束角度
		for(var i=0;i<me.data.length;i++){
			var data = me.data[i];
			var per = data.value/sum;
			startAng = angle;
			angle += (per * Math.PI * 2);
			drawPie(graphics,cx,cy,radius,startAng,angle,getColor(me.svg,i),data.title,me.showPercent,me.showText);
		}

		/**
		 * 绘制扇形区域
		 * @param g 		graphics
		 * @param cx		圆心x坐标
		 * @param cy		圆心y坐标
		 * @param r     	半径
		 * @param angle1 	开始角度
		 * @param angle2 	结束角度
		 * @param color 	颜色
		 * @param text 		文本
		 * @param pos 		文本显示位置 in 在pie内，out在pie外
		 */
		function drawPie(g,cx,cy,r,angle1,angle2,color,text,showPercent,showText){
			var x1 = cx + r * Math.cos(angle1);
			var y1 = cy - r * Math.sin(angle1);
			var x2 = cx + r * Math.cos(angle2);
			var y2 = cy - r * Math.sin(angle2);

			var d = 'M ' + x1 + ' ' + y1 + ' A ' + r  + ' ' + r + ' ,1,0,0, ' +	
					x2 + ' ' + y2 + ' L '  +  cx + ' ' + cy + ' Z';
			var path = DD.newSvgEl('path');
			DD.attr(path,{
				d:d,
				fill:color
			});

			g.appendChild(path);
			var ang = angle1 + (angle2 - angle1)/2;
			//显示百分比
			if(showPercent){
				//计算中心角
				var ang1 = ang * 180/Math.PI;
				//数字显示在pie内部
				//百分比
				var p = DD.newSvgEl('text');
				p.innerHTML = (Math.abs((angle2-angle1)*100/(Math.PI*2))).toFixed(2) + '%';
				var rotate = 0;
				var x0=cx+r-30-text.length*WORDLEN;
				var y0=cy+5;
				var rx = cx;
				var ry = cy;
				if(ang1>90 && ang1<270){
					x0=cx-r+30;
					y0=cy+5;
					ang1 = ang1-180;
				}
				
				DD.attr(p,{
					x:x0,
					y:y0,
					fill:'#fff',
					transform:'rotate('+ (-ang1) + ',' + rx +','+ ry +')'
				});
				g.appendChild(p);
			}	
			//显示每块的文本
			if(showText && text){
				var vlLen = 10; //水平线长度
				var xlLen = 20;  //斜线长度
				//斜线
				x1 = cx + r * Math.cos(ang);
				y1 = cy - r * Math.sin(ang);
				x2 = cx + (r+xlLen) * Math.cos(ang);
				y2 = cy - (r+xlLen) * Math.sin(ang);
				var x3 =  x2;
				var txtX;
				var len1 = text.length * WORDLEN;
				//第2、3象限
				if(x3<cx){
					x3 -= vlLen;
					txtX = x3 - len1 - 5;
				}else{
					x3 += vlLen;
					txtX = x3+5;
				}
				var path = DD.newSvgEl('path');
				DD.attr(path,{
					d:'M' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2 + ' H ' + x3 + '',
					stroke:color,
					'stroke-width':1,
					fill:'none'
				});
				g.appendChild(path);

				//文本
				var t = DD.newSvgEl('text');
				t.innerHTML = text;
				DD.attr(t,{
					x:txtX,
					y:y2+5,
					fill:color
				});
				g.appendChild(t);
			}
		}
	}

	DD.Plugin.create('chart',Chart);
}());