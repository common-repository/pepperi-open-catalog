let PepOpenCatalogUtils = {
	
	ajaxHandlerBaseUrl : '/wp-admin/admin-ajax.php',		
	loaderFadeInOutTime : 100,
	
	FILTER_OPERATORS:{
		eq: "eq",
		neq: "neq",
		lt: "lt",
		gt: "gt",
		numberRange: "numberRange",
		inTheLast: "inTheLast",
		notInTheLast: "notInTheLast",
		today: "today",
		thisWeek: "thisWeek",
		thisMonth: "thisMonth",
		dateRange: "dateRange",
		dueIn: "dueIn",
		notDueIn: "notDueIn",
		on: "on",
		isEmpty: "isEmpty",
		isNotEmpty: "isNotEmpty",
		in: "in",
	},
	
	FIELD_TYPE : {
		None: {name:"None", value:56},
		Default : {name:"Default", value:0},
		TextBox : {name:"TextBox", value:1},
		LimitedLengthTextBox : {name:"LimitedLengthTextBox", value:2},    
		TextArea : {name:"TextArea", value:2},
		TextHeader : {name:"TextHeader", value:4},    
		Date : {name:"Date", value:5},    
		DateAndTime : {name:"DateAndTime", value:6},    
		NumberInteger : {name:"NumberInteger", value:7},    
		NumberReal : {name:"NumberReal", value:8},    
		Currency : {name:"Currency", value:9},    
		Boolean : {name:"Boolean", value:10},    
		ComboBox : {name:"ComboBox", value:11},    
		MultiTickBox : {name:"MultiTickBox", value:12},    
		Separator : {name:"Separator", value:13},    
		Address : {name:"Address", value:14},    
		Percentage : {name:"Percentage", value:15},
		EmptyComboBox : {name:"EmptyComboBox", value:16}, 
		InternalLink : {name:"InternalLink", value:17}, 
		Email : {name:"Email", value:18},
		LimitedDate : {name:"LimitedDate", value:19},    
		Image : {name:"Image", value:20},
		MultiTickBoxToComboBox : {name:"MultiTickBoxToComboBox", value:21},
		EmptyMultiTickBox : {name:"EmptyMultiTickBox", value:22},
		Totals : {name:"Totals", value:23},    
		Attachment : {name:"Attachment", value:24},
		Signature : {name:"Signature", value:25},    
		Link : {name:"Link", value:26},    
		ImageURL : {name:"ImageURL", value:27},
		NumberIntegerQuantitySelector : {name:"NumberIntegerQuantitySelector", value:28}, 
		NumberRealQuantitySelector : {name:"NumberRealQuantitySelector", value:29}, 
		NumberIntegerForMatrix : {name:"NumberIntegerForMatrix", value:30}, 
		NumberRealForMatrix : {name:"NumberRealForMatrix", value:31}, 
		Images : {name:"Images", value:32}, 
		Indicators : {name:"Indicators", value:33}, 
		CalculatedReal : {name:"CalculatedReal", value:34},
		CalculatedInt : {name:"CalculatedInt", value:35},
		CalculatedString : {name:"CalculatedString", value:36},
		CalculatedDate : {name:"CalculatedDate", value:37},
		CalculatedBool : {name:"CalculatedBool", value:38},
		MapDataDropDown : {name:"MapDataDropDown", value:39},
		MapDataReal : {name:"MapDataReal", value:40},
		MapDataString : {name:"MapDataString", value:41},
		MapDataInt : {name:"MapDataInt", value:42},
		Sum : {name:"Sum", value:43},
		Phone : {name:"Phone", value:44},
		UrlForApi : {name:"UrlForApi", value:45},
		ManyToManyUrlForApi : {name:"ManyToManyUrlForApi", value:46},
		ReferenceType : {name:"ReferenceType", value:47},
		GuidReferenceType : {name:"GuidReferenceType", value:48},
		Button : {name:"Button", value:49},
		InternalPage : {name:"InternalPage", value:50}, 
		Duration : {name:"Duration", value:51},
		ListOfObjects : {name:"ListOfObjects", value:52},
		Package : {name:"Package", value:53}, 
		BooleanText : {name:"BooleanText", value:55}, 
		RichTextHTML : {name:"RichTextHTML", value:56},
	},	

	X_ALIGNMENT_TYPE : {
		None : 0,
		Left : 1,
		Right : 2,
		Center : 3,
	},

	Y_ALIGNMENT_TYPE : {
		None : 0,
		Top : 1,
		Bottom : 2,
		Center : 3,
	},
	
	SCREEN_SIZE : {
		Phablet : "Phablet",
		Tablet  :  "Tablet",
		Landscape : "Landscape",		
	},		
	
	doAjax(deferred) {		  
		if(deferred != null){
			  return jQuery.ajax({
							type: deferred.pep_request_type,
							url: deferred.pep_url == null ? this.ajaxHandlerBaseUrl : deferred.pep_url,
							dataType:"json",
							data: deferred.pep_data_url,
							cache: false,
							beforeSend: deferred.pep_request_headers							
					});
			}
		},	
	
	pepApiCall(deferred , loaderClass = null ){	
		var arrRequests = [];
		if(loaderClass)
			PepOpenCatalogUtils.showLoader(loaderClass);
		
		jQuery.each(deferred, function(index, obj) {  
           		arrRequests.push(PepOpenCatalogUtils.doAjax(obj));
            });   
		
		jQuery.when.apply(jQuery, arrRequests)					
		.done(function(){	
			if(deferred.length == 1 && deferred[0] != null) {
				var callbackParams = deferred[0].pep_request_callbackParams ? deferred[0].pep_request_callbackParams : null;				
				deferred[0].pep_request_callback(arguments[0], callbackParams);				
			}else{			
				jQuery.each(arguments, function(index, responseData){
					if(typeof responseData != 'undefined' && responseData){
						var callbackParams =  deferred[index].pep_request_callbackParams ? deferred[index].pep_request_callbackParams : null;
						deferred[index].pep_request_callback(responseData[0], callbackParams);
					}

				 });
			}						
		})
		.fail(function(error){						
		  try{			  
				//var res = JSON.parse(error.responseText);
				//if(res && res.fault.detail.errorcode.toLowerCase() == 'unauthorotized'){//need to get 401 status code fom api
				if(error.status === 401){
					//alert(error.responseText);					
					//window.sessionStorage.removeItem("pep_config");										
					var pep_config = JSON.parse(window.sessionStorage.getItem("pep_config"));	
					pep_config.refreshToken = true;					
					window.sessionStorage.setItem("pep_config",  JSON.stringify(pep_config));
					window.location.reload();
				}else{
					//alert(error.responseText);											
					console.log(error.responseText);
				}
		  }catch(e){			  
			  //window.sessionStorage.removeItem("pep_config");			  
			  var pep_config = JSON.parse(window.sessionStorage.getItem("pep_config"));	
			  pep_config.refreshToken = true;					
			  window.sessionStorage.setItem("pep_config",  JSON.stringify(pep_config));
			  window.location.reload();			  
		  }
		})
		.always(function(data){			
			if(loaderClass)
			   PepOpenCatalogUtils.hideLoader(loaderClass);
		});
	},
	
	hideLoader(loaderClass) {	
			//var preloader = jQuery('.spinner-wrapper');
			//preloader.fadeOut(this.preloaderFadeOutTime);		
			var preloader = jQuery('.' + loaderClass);	
			preloader.css({"opacity":"1","pointer-events":"all"});						
	},
		
	showLoader(loaderClass) {		
		//var preloader = jQuery('.spinner-wrapper');		
		//preloader.fadeIn(this.preloaderFadeOutTime);
		var preloader = jQuery('.' + loaderClass);	
		preloader.css({"opacity":"0.6","pointer-events":"none"});			
	},
	
	getQueryParameterByName(name, url = window.location.href) {
		name = name.replace(/[\[\]]/g, '\\$&');
		var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	},
	
	dataConvertor(dava_view, data, options = {currentView: null}){		
		var in_DataView = dava_view, in_Data = data;; 
		var uiControl = { Columns: in_DataView.Columns.length, ControlFields: []};		
		jQuery.each(in_DataView.Fields, function(index, field) {    
		    uiControl.ControlFields.push({ApiName:field.FieldID, 
                                          Mandatory: field.Mandatory, ReadOnly: field.ReadOnly, Title: field.Title, 
                                          Layout: {Height:field.Layout.Size.Height , Width:field.Layout.Size.Width, X:field.Layout.Origin.X , Y:field.Layout.Origin.Y,                        
                                                   XAlignment:PepOpenCatalogUtils.X_ALIGNMENT_TYPE[field.Style.Alignment.Horizontal] , YAlignment:PepOpenCatalogUtils.Y_ALIGNMENT_TYPE[field.Style.Alignment.Vertical], LineNumber:0},
                                          FieldType:  PepOpenCatalogUtils.FIELD_TYPE[field.Type].value
		                                  });
	    });
		
	 var controlData = [];
        jQuery.each(in_Data.Products, function(index, dataRow) { 
			if(dataRow){
				var controlDataFields = [];
				jQuery.each(uiControl.ControlFields, function(_index, field) {  
					var value = dataRow[field.ApiName + ".Value"]; 
					var f_value = dataRow[field.ApiName+ ".Value"]; 
					
					switch(field.FieldType){//build the thumbnail to display in opne catalog instead of the large image
							case PepOpenCatalogUtils.FIELD_TYPE.Image.value:
							    if(f_value != ''){
									var pathArr = f_value.split('/'),
										filenameWithExtensionArr = pathArr.pop().split('.'),
										newFileName = filenameWithExtensionArr[0] + "_200x200." + filenameWithExtensionArr[1];									
										//value = f_value = f_value.slice(0,f_value.lastIndexOf('/') + 1) + newFileName;//.split('?')[0];	
									if(options.currentView == null || options.currentView.key == 'cards'){
										value = f_value = f_value.slice(0,f_value.lastIndexOf('/') + 1) + newFileName;//.split('?')[0];	
									}									
								}
								break;
							/*
							case PepOpenCatalogUtils.FIELD_TYPE.NumberInteger.value:
							case PepOpenCatalogUtils.FIELD_TYPE.NumberReal.value:						    
							case PepOpenCatalogUtils.FIELD_TYPE.NumberIntegerQuantitySelector.value: 
							case PepOpenCatalogUtils.FIELD_TYPE.NumberRealQuantitySelector.value: 
							case PepOpenCatalogUtils.FIELD_TYPE.NumberIntegerForMatrix.value: 
							case PepOpenCatalogUtils.FIELD_TYPE.NumberRealForMatrix.value: 
							case PepOpenCatalogUtils.FIELD_TYPE.CalculatedReal.value: 
							case PepOpenCatalogUtils.FIELD_TYPE.CalculatedInt.value: 
							case PepOpenCatalogUtils.FIELD_TYPE.MapDataReal.value: 
							case PepOpenCatalogUtils.FIELD_TYPE.MapDataInt.value:
								// leave undefined to use the browser's locale, or use browsers culture like 'en-US'
								f_value = dataRow[field.ApiName+ ".Value"].toLocaleString(undefined, { minimumFractionDigits: 2 }); 
								break;
							case PepOpenCatalogUtils.FIELD_TYPE.Currency.value:								
						    	f_value = dataRow[field.ApiName+ ".Value"].toLocaleString(undefined, {style: 'currency', currency: 'USD', minimumFractionDigits: 2}); 																break;
							case PepOpenCatalogUtils.FIELD_TYPE.Percentage.value:
								break;	
							*/
						default:
							break;
					}
					
					controlDataFields.push( {ApiName:field.ApiName , FieldType:field.FieldType , FormattedValue: dataRow[field.ApiName+ ".Value"] == null ? '' : f_value, 
					Value: dataRow[field.ApiName+ ".Value"] == null ? '' : value });
				});                
				controlData.push({ Fields: controlDataFields, UID:dataRow.UUID, Type: 0});
			}
        });
		
		 return { data_view:uiControl, data: controlData } ;
	},	
	
	getRequestDefaultOptions( plugin_config, user_options = {}, screenSize = 'Tablet'){
			 var controlFieldsApiNames = [], searchFieldsApiNames = [], distinctFieldsApiNames = [],
                 in_options = {where:'', search_string: '', search_string_fields:'', distinct_fields: '', order_by: '' , page_size: 100, page: 1, fields: '', include_count:true};		   
                  
             jQuery.extend(in_options, user_options);//merge new option object into default object		    
                 
			 var views_control = this.getControlByScreenSize(plugin_config.data_configuration.DataViews,"OrderViewsMenu", screenSize);
			 if(typeof(views_control) !== 'undefined'){
					jQuery.each(views_control.Fields, function(index, field) {    		
						var currentView_control = PepOpenCatalogUtils.getControlByScreenSize(plugin_config.data_configuration.DataViews,field.FieldID, screenSize);
						if(typeof(currentView_control) !== 'undefined'){
							jQuery.each(currentView_control.Fields, function(index, item) {    		
								controlFieldsApiNames.push(item.FieldID);
							});
						}
					});
				controlFieldsApiNames.push("UUID");		
			 }
		
			 var searchFields_control = this.getControlByScreenSize(plugin_config.data_configuration.DataViews,"OrderCenterSearch", screenSize);	
			 if(typeof(searchFields_control) !== 'undefined'){
				 jQuery.each(searchFields_control.Fields, function(index, field) {    		                
							searchFieldsApiNames.push(field.FieldID + ".Value");                
					});
			 }
        	 
			 var smartSearchFields_control = this.getControlByScreenSize(plugin_config.data_configuration.DataViews,"SmartSearch", screenSize);	
		 	 if(typeof(smartSearchFields_control) !== 'undefined'){
				 jQuery.each(smartSearchFields_control.Fields, function(index, field) { 				
							distinctFieldsApiNames.push(field.FieldID + ".Value");                
					});	
		 	 }
				
             in_options.fields = in_options.fields == '' ? controlFieldsApiNames.join() : in_options.fields;	
             in_options.search_string_fields = in_options.search_string_fields == '' ? searchFieldsApiNames.join() : in_options.search_string_fields;	
		 	 in_options.distinct_fields = in_options.distinct_fields == '' ? distinctFieldsApiNames.join() : in_options.distinct_fields;			
			
			return in_options;
	},	
	
	getFilterType(item){
		var componentType,type;
		
		switch(item.Type) {
				case PepOpenCatalogUtils.FIELD_TYPE.TextBox.name:
				case PepOpenCatalogUtils.FIELD_TYPE.LimitedLengthTextBox.name:    
				case PepOpenCatalogUtils.FIELD_TYPE.TextArea.name:					
				case PepOpenCatalogUtils.FIELD_TYPE.TextHeader.name:
				case PepOpenCatalogUtils.FIELD_TYPE.MultiTickBox.name:
				case PepOpenCatalogUtils.FIELD_TYPE.BooleanText.name:
				case PepOpenCatalogUtils.FIELD_TYPE.Email.name:
				case PepOpenCatalogUtils.FIELD_TYPE.CalculatedString.name:
				case PepOpenCatalogUtils.FIELD_TYPE.MapDataString.name:
				case PepOpenCatalogUtils.FIELD_TYPE.ComboBox.name:
							componentType = 'multi-select';
							type = 	'multi-select';
					break;
				case PepOpenCatalogUtils.FIELD_TYPE.Date.name:   					   
				case PepOpenCatalogUtils.FIELD_TYPE.LimitedDate.name:
				case PepOpenCatalogUtils.FIELD_TYPE.CalculatedDate.name:
							componentType = 'date';
							type = 	'date';
					break;
				case PepOpenCatalogUtils.FIELD_TYPE.DateAndTime.name:
					        componentType = 'date';
							type = 	'date-time';
					break;
				case PepOpenCatalogUtils.FIELD_TYPE.Currency.name:					  
							componentType = 'number';
							type = 	'currency';
					   break;
				case PepOpenCatalogUtils.FIELD_TYPE.NumberInteger.name:   					  					  
				case PepOpenCatalogUtils.FIELD_TYPE.CalculatedInt.name:				   
		        case PepOpenCatalogUtils.FIELD_TYPE.MapDataInt.name:
							componentType = 'number';
							type = 	'int';
					   break;
				case PepOpenCatalogUtils.FIELD_TYPE.Percentage.name:					  		              
							componentType = 'number';
							type = 	'percentage';
					   break;		
				case PepOpenCatalogUtils.FIELD_TYPE.NumberReal.name:				  
				case PepOpenCatalogUtils.FIELD_TYPE.CalculatedReal.name:				   
				case PepOpenCatalogUtils.FIELD_TYPE.MapDataReal.name:			               
							componentType = 'number';
							type = 	'real';
					   break;																										
				case PepOpenCatalogUtils.FIELD_TYPE.Boolean.name:   
				case PepOpenCatalogUtils.FIELD_TYPE.CalculatedBool.name:
							componentType = 'boolean';
							type = 	'boolean';
 					   break;
				  default://text field  
							componentType = 'multi-select';
							type = 	'multi-select';
			}
		
		return {ComponentType: componentType, Type: type};
	},	
	
	getFiltersExpression(currentFilter, fields){
		   var in_expresion = '';
		
		   switch(currentFilter.operator.id){
			   case PepOpenCatalogUtils.FILTER_OPERATORS.eq: //NUMBER, =
				   in_expresion = currentFilter.fieldId + ".Value" +  currentFilter.operator.short + currentFilter.value.first;												
				   break;
			   case PepOpenCatalogUtils.FILTER_OPERATORS.neq: //NUMBER, !=				   
				   in_expresion = currentFilter.fieldId + ".Value!=" +  currentFilter.value.first;																																	break;
			   case PepOpenCatalogUtils.FILTER_OPERATORS.lt://NUMBER, "<"
				   in_expresion = currentFilter.fieldId + ".Value" +  currentFilter.operator.short + currentFilter.value.first;		
				   break;
			   case PepOpenCatalogUtils.FILTER_OPERATORS.gt://NUMBER, ">"
				   in_expresion = currentFilter.fieldId + ".Value" +  currentFilter.operator.short + currentFilter.value.first;		
				   break;
			   case PepOpenCatalogUtils.FILTER_OPERATORS.numberRange: //NUMBER, >= and <=
				   in_expresion = currentFilter.fieldId + ".Value>=" +  currentFilter.value.first + " and " + currentFilter.fieldId + ".Value<=" +  currentFilter.value.second;										   break;
			   case PepOpenCatalogUtils.FILTER_OPERATORS.dateRange://DATE, DATEANDTIME >=x AND <=Y
				   in_expresion = currentFilter.fieldId + ".Value>=" +  currentFilter.value.first + " and " + currentFilter.fieldId + ".Value<=" +  currentFilter.value.second;				   
				   if(fields.find(field => field.id == currentFilter.fieldId).type == 'date')
				    in_expresion = currentFilter.fieldId + ".Value>=" + new Date(currentFilter.value.first).toISOString() + " and " + currentFilter.fieldId + ".Value<=" +  new Date(currentFilter.value.second).toISOString();		
				   break; 
			   case PepOpenCatalogUtils.FILTER_OPERATORS.in://STRING, mult tick
				   in_expresion = currentFilter.fieldId + ".Value=" +  currentFilter.value.first.join(';');			
			   break;   
				/* NOT SUPPORTED RIGHT NOW  
			   case PepOpenCatalogUtils.FILTER_OPERATORS.inTheLast://date, need conversion, only with ><=
				   //in_operator = filter.operator.short;
				   break;
			   case PepOpenCatalogUtils.FILTER_OPERATORS.notInTheLast://date, need conversion, only with ><=
				   //in_operator = filter.operator.short;
				   break;
			   case PepOpenCatalogUtils.FILTER_OPERATORS.today://date, need conversion, only with ><=
				   //in_operator = filter.operator.short;
				   break;
			   case PepOpenCatalogUtils.FILTER_OPERATORS.thisWeek://date, need conversion, only with ><=
				   //in_operator = filter.operator.short;
				   break;
			   case PepOpenCatalogUtils.FILTER_OPERATORS.thisMonth://date, need conversion, only with ><=
				   //in_operator = filter.operator.short;
				   break;			
			   case PepOpenCatalogUtils.FILTER_OPERATORS.dueIn://date, need conversion, only with ><=
				   //in_operator = filter.operator.short;
				   break;
			   case PepOpenCatalogUtils.FILTER_OPERATORS.notDueIn://date, need conversion, only with ><=
				   //in_operator = filter.operator.short;
				   break;
			   case PepOpenCatalogUtils.FILTER_OPERATORS.on://date, need conversion, only with ><=
				   //in_operator = filter.operator.short;
				   break;
			   case PepOpenCatalogUtils.FILTER_OPERATORS.isEmpty://date, need conversion, only with ><=
				   //in_operator = filter.operator.short;
				   break;
			   case PepOpenCatalogUtils.FILTER_OPERATORS.isNotEmpty://date, need conversion, only with ><=
				   //in_operator = filter.operator.short;
				   break;			 
				*/   
			   default://equal
				   alert(currentFilter.operator.id + " not found.");
		   } 	
		
		return in_expresion;
	},
	
	setBreadCrumbs(breadCrumbs, selector){			
		if(selector){			
			selector.displayType = 'items';
			var items = [{key:this.getPluginSettings().pages.pep_topitems_page_url, text:'Home', title: 'Home'}]
			jQuery.each(breadCrumbs, function(index, item) {    
				items.push({key:'', text:item, title:item, disabled: true});
			}); 
			
			selector.items = items;
		}													
	},	
	
    getCategoryChildItems(childrens){
        var childsArr = [];
        jQuery.each(childrens, function(index, item) { 
            var childObj = item.Nodes && item.Nodes.length ? PepOpenCatalogUtils.getCategoryChildItems(item.Nodes) : [];
            childsArr.push({key:item.UUID, text: item.Name, path: item.Path, children: childObj });
        });
        return childsArr;
    },    
	
    getCategoryItems(item){
        var childArr = item.Nodes && item.Nodes.length ? PepOpenCatalogUtils.getCategoryChildItems(item.Nodes) : [];
        return {key:item.UUID, text: item.Name, path: item.Path, children: childArr};
    },	
	
	setScreenSize(cssStr, callback = null){			
		var currSize = ''; 	   	
		switch(cssStr){
			case 'lg':	{
				currSize = 'is-1';
				break;
			} 
			case 'md':	{
				currSize = 'is-2'; 
				break;
			} 
			case 'sm':	{
				currSize = 'is-3';
				break;
			} 
			case 'xs':	{
				currSize = 'is-4';
				break;
			} 
				default : {
					currSize = 'is-0'; // XL
					break;
				}
		}
 
		body = jQuery('body');
		body.removeClass (function (index, className) {
    				return (className.match (/\bis-\S+/g) || []).join(' ');
		});
		
		body.addClass(currSize);		
		if(callback){
			callback(currSize);
		}	
		
	},		
	
	getControlByScreenSize(dataViews_arr, uiControlApiName, screenSize){
		var controlObj = null;
		
		switch(screenSize){
			case 'lg':	//Landscape
			case 'xl':
				controlObj = dataViews_arr.find( view => view.Context.Name == uiControlApiName && view.Context.ScreenSize == PepOpenCatalogUtils.SCREEN_SIZE.Landscape);							
				break;			 
			case 'md':	//Tablet
			case 'sm':				
				controlObj = dataViews_arr.find( view => view.Context.Name == uiControlApiName && view.Context.ScreenSize == PepOpenCatalogUtils.SCREEN_SIZE.Tablet);	
				break;			 			
			case 'xs':	//Phablet
				controlObj = dataViews_arr.find( view => view.Context.Name == uiControlApiName && view.Context.ScreenSize == PepOpenCatalogUtils.SCREEN_SIZE.Phablet);
				break;			 
			default : //Tablet
				controlObj = dataViews_arr.find( view => view.Context.Name == uiControlApiName && view.Context.ScreenSize == PepOpenCatalogUtils.SCREEN_SIZE.Tablet);	
				break;			
		}
		
		if(typeof(controlObj) == 'undefined'){//get tablet control as default 
			controlObj = dataViews_arr.find( view => view.Context.Name == uiControlApiName && view.Context.ScreenSize == PepOpenCatalogUtils.SCREEN_SIZE.Tablet);
		}
		
		return controlObj;
	},

    parsePepperiJwt (token) {
		var base64Url = token.split('.')[1];
		var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));

		return JSON.parse(jsonPayload);
	},
		
	changeTopbarElements(event){		
				if(event.detail.state === 'open'){
					jQuery('.pepHeader').addClass('search-is-open');
				} else{
						jQuery('.pepHeader').removeClass('search-is-open');
				}				
	},
	
	getPluginSettings(){		
		return plugin_Settings;
	}
}

window.PepOpenCatalogUtils = PepOpenCatalogUtils;