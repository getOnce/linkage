define(function(){
	/**
	*联动下拉选项
	*@param opt {object}参数
	*@param opt.selects {array}select的各项信息
	*@param opt.selects[0].tar {string selector||dom||jquery dom obejct}select选择器或对象
	*@param opt.selects[0].url{string} 取得数据的url
	*@param opt.selects[0].data{object} select列表数据内容
	*@param opt.selects[0].disabled(number||boolean)是否禁用,默认禁用
	*@param opt.selects[0].typeValue(string)请求数据的类型，比如：国家、省、区、市
	*/
	function LinkAge(opt){
		$.extend(this,opt||{});
		this.init();

	}
	LinkAge.prototype = {
		init:function(){
			var me = this;
			if(me.selects){
				me.displayData(me.selects);
			}
			me.sum = me.selects.length;
			me.bindEvent();
		},
		//设置索引，如果user没用设置索引则启用这个
		displayData:function(data){
			var me = this;
			$.each(data,function(i,item){
				item["index"] = i;
				$(item["tar"])
				.addClass("js-linkpage-selector")
				.attr("data-linkpage-index",i)
				.prop("disabled",(typeof(item["disabled"])=='undefined'?true:(item["disabled"])));
			});
		},
		/**
		*把select元素设置为disable
		*@param tar{dom object||jquery dom object}
		*/
		setDisable:function(tar,status){
			$(tar).prop("disabled",true);
			$(this).trigger("setDisableEvent",tar);
			if(typeof(status)=='undefined'||!status){
				$(tar).val(0);
			}
		},
		removeDisable:function(tar){
			$(tar).prop("disabled",false);
			$(this).trigger("removeDisableEvent",tar)
		},
		/**
		*@param opt {object||number||string}参数
		*@param opt {type==number}此时代表select selects数组里面的index值
		*@param opt {type==object} "选择器对象"
		*/
		getTar:function(opt){
			var type = typeof(opt),tar = "",me = this;
			switch(type){
				case "number":
				tar = me.selects[opt];
				break;
				case "object":
				tar = $(opt)
				break;
			}
			return tar;
		},
		/**
		*取得数据
		*@param opt{object}取得ajax配置的参数
		*@param opt.testData {object}模拟数据
		*@param index {number}selects索引
		*/
		getData:function(opt,index){
			var me = this,req = $.extend({
				dataType:"json",
				success:function(data){
					me.setData(data,index);
				},
				error:function(data){
					$(me).trigger("getDataErrorEvent",{data:data,index:index});
				}
			},opt||{});
			if(req.testData){
				if(req.testData.error_code==0){
					req.success(req.testData);
				}else{
					req.error(req.testData)
				}
				return;
			}
			$.ajax(req);
		},
		/**
		*设置数据
		*@param data {object}
		*/
		setData:function(data,index){
			var me = this;
			me.selects[index]["data"] = data.data.list;
			$(me).trigger("setDataEvent",index);
		},
		bindEvent:function(){
			var me = this;
			//选择事件
			$(document).on("change.linkage",".js-linkpage-selector",function(e){
				$(me).trigger("changeEvent",this);
				var $t = $(this),val = $t.val();
				switch(val){
					case "0":
					case 0:
					var cur = $t.attr("data-linkpage-index")-0,
					leave = me.sum-cur;
					while(--leave){
						cur+=1;
						me.setDisable($(me.selects[cur].tar));
					}
					break;
					default:
					var cur = $t.attr("data-linkpage-index");
					if(cur==me.sum-1){
						return
					}else{
						$(me).trigger("doGetDataEvent",{index:cur-0+1,value:val});
					}
					break;
				}

			});
			/**
			*opt.index：selects的index;
			*opt.value选择的值
			*/
			$(me).on("doGetDataEvent",function(e,opt){
				var data = me.selects[opt["index"]];
				me.getData({
					url:data.url,
					testData:testData||false,
					data:{
						type:data["typeValue"]||"",
						value:opt["value"]
					}
				},opt["index"]);
			});
			//设置数据成功
			$(me).on("setDataEvent",function(e,index){
				var select = me.selects[index];
				var $dom = $(select.tar).find("option[value!=0]").remove();
				var length = select.data.length;
				var str = '';
				var data = select.data;
				while(length--){
					str+='<option value="'+data[length]["id"]+'">'+data[length]["value"]+'</option>';
				}
				me.removeDisable($(select.tar));
				$(str).appendTo($(select.tar))
				$dom.append(str);
				if(me.sum-1==index){
					return;
				}
				var leave = me.sum - index -1,i = index;
				while(leave--){
					i+=1;
					me.setDisable($(me.selects[i].tar));
				}
				
			})
		},

	}
	return LinkAge;
})











