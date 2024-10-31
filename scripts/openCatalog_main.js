(function() {            
    var pepListItems = {
    	__proto__: window.pepComponents,    
		productItemsState : null,
        elSearch : 	null, 
		searchResultsPattern: "Search results: {{searchValue}}",
        elMenu : null,
        elViews: null,
        elSort: null,
        elList: null,
		elSideBar: null,
		elFilterMenuButton : null,
		elSmartFilter: null,
		elSizeDetect: null,
		elBreadCrumbs: null,
		apiItemsBulkSize: 200,
		lastSearchKeyword: '',
		lastSelectedCategory: null,
		pepItems: [],
		
        
    init(){ 
		
		super.init({ 
			objectName: pepListItems, components: [
				{propName:'elSearch', htmName:'pep-web-search', events: [{eventName:'stateChange',eventCallback: window.PepOpenCatalogUtils.changeTopbarElements}, {eventName:'search', eventCallback:pepListItems.search}]},
				{ propName:'elMenu', htmName:'pep-web-menu', events: [{eventName:'menuItemClick' ,eventCallback:pepListItems.menuItemClick }]},
				{ propName:'elSizeDetect', htmName:'pep-size-detect', events: [{eventName: 'sizeChange',eventCallback: pepListItems.setScreenSize}]},
				{ propName:'elFilterMenuButton', htmName:'#pep-filter-menu',   events: [{eventName: 'click',eventCallback: pepListItems.filterMenuButtonClick}]},
				{ propName:'elBreadCrumbs', htmName:'pep-bread-crumbs',   events: [{eventName: 'itemClick',eventCallback: pepListItems.breadCrumbsClick}]},
				{ propName:'elSmartFilter', htmName:'pep-smart-filters',   events: [{eventName: 'filtersChange',eventCallback: pepListItems.smartFilterChange}]},
				{ propName:'elViews', htmName:'pep-list-views',   events: [{eventName: 'change',eventCallback: pepListItems.viewChange}]},
				{ propName:'elSort', htmName:'pep-list-sorting',   events: [{eventName: 'change',eventCallback: pepListItems.sortChange}]},
				{ propName:'elSideBar', htmName:'pep-side-bar',   events: [{eventName:'stateChange',eventCallback: pepListItems.sideBarStateChange}]},
				{ propName:'elList', htmName:'pep-list',   events: [{eventName: 'loadPage',eventCallback: pepListItems.loadListPage},{eventName: 'itemClick',eventCallback: pepListItems.itemListClick}]}
			]
		});				  			
		
		this.elFilterMenuButton.classList.add('showOnOpenCatalog');
		this.productItemsState = {SortState:null, ViewState:null, FiltersState: {filters:null, fields:null}, CategoryUUID: null, search_string: '', pager: {pageSize: pepListItems.apiItemsBulkSize, pageIndex: 0} };
			
		var items_params = JSON.parse(window.sessionStorage.getItem("ItemsParams"));	
		if(items_params != null){			
			jQuery.extend(this.productItemsState, items_params);
			this.lastSearchKeyword = this.productItemsState.search_string;
		}

		pepListItems.screenSize = this.elSizeDetect.getCurrentSize().name;				
		
		var categoryUUIDparam =  this.productItemsState.CategoryUUID == null ? this.output.data_configuration.CategoriesTree[0].UUID : this.productItemsState.CategoryUUID.key,  
		    searchStringParam = this.productItemsState.search_string,		  
			whereQuery = this.getWhereQuery({categoryUUID: [categoryUUIDparam], filters:this.productItemsState.FiltersState.filters}),
			currentPage = parseInt((pepListItems.output.pluginSettings.pages.pep_item_per_page_key * this.productItemsState.pager.pageIndex) / this.productItemsState.pager.pageSize) + 1;			
			var sortStateParam; 
			if(this.productItemsState.SortState == null){
				var sort_control = PepOpenCatalogUtils.getControlByScreenSize(this.output.data_configuration.DataViews,"OrderCenterUserSort", pepListItems.screenSize);
				if(typeof(sort_control) !== 'undefined'){
					sortStateParam = sort_control.Fields[0].FieldID + ".Value Asc";
				}else{
					sortStateParam = '';
				}
			}else{
				sortStateParam = this.productItemsState.SortState.sortBy;
			}
		 
        this.getItems({getItemsCallback: {function: pepListItems.getItemsCallback}, getFiltersCallback: {function:pepListItems.getFiltersCallback, params:this.productItemsState.FiltersState}},  {where:whereQuery, order_by: sortStateParam, search_string: searchStringParam, page_size: /*currentPage **/ this.productItemsState.pager.pageSize , page: currentPage/*1*/ });   	
        
		pepListItems.initComponents();
    },	 				  
    
    initComponents(){							
		PepOpenCatalogUtils.setScreenSize(pepListItems.screenSize);						
        //initialize sort menu object
        var arr = [],
		    sort_control= PepOpenCatalogUtils.getControlByScreenSize(pepListItems.output.data_configuration.DataViews,"OrderCenterUserSort", pepListItems.screenSize);
		if(typeof(sort_control) != 'undefined'){
			jQuery.each(sort_control.Fields, function(index, item) {  						            
				arr.push({sortBy: item.FieldID + ".Value Asc", title: item.Title, isAsc: true, iconName:'arrow_up'});	//one for asc and one for desc						
				arr.push({sortBy: item.FieldID + ".Value Desc", title: item.Title, isAsc: false, iconName:'arrow_down'});				
			});		
			this.elSort.options = arr;			 
		}
        
        //initialize views menu object
        this.elViews.views = [];
		var views_control =  PepOpenCatalogUtils.getControlByScreenSize(pepListItems.output.data_configuration.DataViews,"OrderViewsMenu", pepListItems.screenSize);
        jQuery.each(views_control.Fields, function(index, item) {
			if(item.FieldID !== "OrderCenterGrid"){//remove grid view from views menu
					pepListItems.elViews.views.push({apiName:item.FieldID, key: (item.Title == 'Small' || item.Title == 'Medium' || item.Title == 'Large') ? 'cards' : 'lines', title: item.Title, iconName: (item.Title == 'Small' || item.Title == 'Medium' || item.Title == 'Large') ? 'view_card_md' :'view_line'});
        }});         		
		
		super.initComponents({Object_name:pepListItems , components:[{componentName:'pep-web-menu', iconName:'arrow_down', type:'action-select', styleType: 'regular'}]});       
		pepListItems.elMenu.selectedItem = this.productItemsState.CategoryUUID == null ? pepListItems.elMenu.items[0] : this.productItemsState.CategoryUUID;		
		pepListItems.lastSelectedCategory = pepListItems.elMenu.selectedItem;
		
		pepListItems.elSearch.value = this.productItemsState.search_string;
		
		var defaulView = this.elViews.views.find(({ key}) => key === 'cards' );//cards is the default view
		defaulView = typeof(defaulView) == 'undefind' ? this.elViews.views[0] : defaulView;
		pepListItems.elViews.currentView = this.productItemsState.ViewState == null ? {apiName:defaulView.apiName, key: defaulView.key, title: defaulView.title, iconName: defaulView.iconName} :  this.productItemsState.ViewState;  	            
		pepListItems.elSort.currentSorting = this.productItemsState.SortState == null ? this.elSort.options == null ? '' : this.elSort.options[0] : this.productItemsState.SortState;						pepListItems.elSmartFilter.filters = this.productItemsState.FiltersState.filters;				
		var breadCrumbs_path = pepListItems.elSearch.value == '' ? pepListItems.elMenu.selectedItem.path : [pepListItems.searchResultsPattern.replace('{{searchValue}}',pepListItems.elSearch.value)];	      PepOpenCatalogUtils.setBreadCrumbs(breadCrumbs_path, this.elBreadCrumbs);		        
		
		this.elSideBar.showFooter= false;         
		
        this.elList.pagerType = 'pages';
        this.elList.pageSize = pepListItems.output.pluginSettings.pages.pep_item_per_page_key;		
        this.elList.supportResizing = true;
		this.elList.scrollAnimationTime = 0;//ms
		this.elList.lockItemInnerEvents = true;		
        this.elList.selectionTypeForActions = 'none';		
		this.elList.pageIndex = this.productItemsState.pager.pageIndex;			
        //this.initList();											   		
		
		window.sessionStorage.removeItem("ItemsParams");
		this.productItemsState = null;		
        
    },	    					    
    
    initList(){					          
		
		pepListItems.updateLocalItems();				
		pepListItems.sliceListItems();
		
        var control = PepOpenCatalogUtils.getControlByScreenSize(pepListItems.output.data_configuration.DataViews,pepListItems.elViews.currentView.apiName,pepListItems.screenSize),
            res = PepOpenCatalogUtils.dataConvertor(control,pepListItems.output.data, {currentView: pepListItems.elViews.currentView});	 					    				
        pepListItems.elList.initListData(res.data_view,pepListItems.output.data.TotalCount,res.data,pepListItems.elViews.currentView.key);        	
		const totalElemnts = document.querySelectorAll('.total-num');			       
		 jQuery.each(totalElemnts, function(index, item){
			 //item.innerHTML = pepListItems.output.data.TotalCount.toString();
			 item.innerHTML = pepListItems.output.data.TotalCount.toLocaleString(undefined, { minimumFractionDigits: 0 }); 
			 
		 	});			
    },  		
	
	updateListPage(data = null, params){	
		if(data){
			pepListItems.output.data = data;
			pepListItems.updateLocalItems(params);
		}
		
		if(typeof pepListItems.pepItems[pepListItems.output.pluginSettings.pages.pep_item_per_page_key * pepListItems.elList.pageIndex] !== 'undefined'){
		//items exist in the array
			pepListItems.sliceListItems();			
		}
		
		var control = PepOpenCatalogUtils.getControlByScreenSize(pepListItems.output.data_configuration.DataViews,pepListItems.elViews.currentView.apiName,pepListItems.screenSize);
		var res = PepOpenCatalogUtils.dataConvertor(control,pepListItems.output.data);									
		
        pepListItems.elList.updatePage(res.data,{pageIndex:pepListItems.elList.pageIndex, pageSize:pepListItems.elList.pageSize});	
		pepListItems.elList.pageIndex = pepListItems.elList.pageIndex;//talk to tomer
		
         
	},
	
	updateLocalItems(in_currenPage = null){
		  var currentPage = in_currenPage ? in_currenPage : parseInt((pepListItems.output.pluginSettings.pages.pep_item_per_page_key * pepListItems.elList.pageIndex) / pepListItems.apiItemsBulkSize ) ;
	      var position = (currentPage) * pepListItems.apiItemsBulkSize;
		
		  jQuery.each(pepListItems.output.data.Products, function(index, product) {    
			   pepListItems.pepItems[position] = product;
			  position++;
          });							  		
	},
	
	clearLocalItems(){
		pepListItems.pepItems = [];
		pepListItems.elList.pageIndex = 0; 
	},
	
	sliceListItems(){				
		var start = pepListItems.output.pluginSettings.pages.pep_item_per_page_key * pepListItems.elList.pageIndex,
		    end = start + pepListItems.apiItemsBulkSize;
		pepListItems.output.data.Products = [];		
		pepListItems.output.data.Products = pepListItems.pepItems.slice(start, end);
	},
		
	getItems(callback, options = {}){ 		
		    if(pepListItems.elMenu.selectedItem && pepListItems.elMenu.selectedItem.key == ''){
				//in case user is soring/change category/move backward or forward on list/filtering, in mode of "categories" (all categories)
				//we are using the last search keyword in case he deleted it from the search component 
			   options.search_string = this.lastSearchKeyword;
			   pepListItems.elSearch.value  = this.lastSearchKeyword;
			}
		
		  	var in_options = PepOpenCatalogUtils.getRequestDefaultOptions(pepListItems.output ,options, pepListItems.screenSize),				
		        getItemsRequest =  {pep_url:pepListItems.papiApiDomain + '/open_catalog/items?where=' + encodeURIComponent(in_options.where) + '&search_string=' + encodeURIComponent(in_options.search_string) + '&search_string_fields=' + in_options.search_string_fields + '&order_by=' + in_options.order_by + '&page_size=' + in_options.page_size + '&page=' + in_options.page + '&fields=' + in_options.fields + '&include_count=' + in_options.include_count, pep_data_url: {}, pep_request_type: 'GET', pep_request_callback: callback.getItemsCallback.function, pep_request_callbackParams: callback.getItemsCallback.params,  pep_request_headers: function (xhr) {
                                        xhr.setRequestHeader('Authorization', 'Bearer ' + pepListItems.pepperi_token)}
		 };
		 
		    var getFilterRequest = {pep_url:pepListItems.papiApiDomain + '/open_catalog/filters?where=' + encodeURIComponent(in_options.where) + '&search_string=' + encodeURIComponent(in_options.search_string) + '&search_string_fields=' + in_options.search_string_fields + '&distinct_fields=' + in_options.distinct_fields, pep_data_url: {}, pep_request_type: 'GET', pep_request_callback: callback.getFiltersCallback.function, pep_request_callbackParams: callback.getFiltersCallback.params, pep_request_headers: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + pepListItems.pepperi_token)}
		};			   		
		
		/*
		if(in_options.distinct_fields == '' || !callback.getFiltersCallback.function){
		 			getFilterRequest = null;		 								
		}
		
		PepOpenCatalogUtils.pepApiCall([getItemsRequest, getFilterRequest]);
			*/					
		
		
		PepOpenCatalogUtils.pepApiCall([getItemsRequest], 'rightContainer');
		
		if(in_options.distinct_fields == '' || !callback.getFiltersCallback.function){		 			
					return;
		}
		
		PepOpenCatalogUtils.pepApiCall([getFilterRequest], 'smart-filters-container');
		
		
		                                    
     },    		
    
	getWhereQuery(options){
	    /********* categoryUUID: array of strings ***********/
	    /********* filters: array of objects, same format as in smartfilters component *********/
	    /********* fields: array of objects, each object has 2 props: fieldName & Value *********/	    
	    
		var defaults = {categoryUUID: [''], filters:[],  fields: []},
			in_categories='',
			in_filters=[],
			in_fields=[],
			in_expression,
			categories;
									 
		jQuery.extend(defaults, options);
									 
		categories = defaults.categoryUUID.join();							 
		in_categories = categories == '' ? '' : "CategoryUUID=" + defaults.categoryUUID.join();		
									 
		jQuery.each(defaults.filters, function(index, filter) {							
										in_expression = PepOpenCatalogUtils.getFiltersExpression(filter, pepListItems.elSmartFilter.fields);			                         			
										in_filters.push(in_expression)									 	
									});									 
									 
		jQuery.each(defaults.fields, function(index, field) {			
										in_fields.push(field.fieldName + ".Value=" + field.value);							
									});											 
		
		//var temp = [in_categories, in_filters.join(',').replace(/,/g , ' and '), in_fields.join(',').replace(/,/g , ' and ')];
		var temp = [in_categories, in_filters.join('{#}').replace(/{#}/g , ' and '), in_fields.join(',').replace(/,/g , ' and ')];
			temp = temp.filter(Boolean).join('{#}').replace(/{#}/g , ' and ');//.replace(/;/g , ',');						 
									 
		return temp;																	   
								
	},
	
	filterMenuButtonClick(event)	{
		pepListItems.elSideBar.open();			
		pepListItems.setSmartFilterDomLocation(pepListItems.elSizeDetect.getCurrentSize().name);
	},
		
	breadCrumbsClick(event)	{
		window.location.href = event.detail.source.key;
	},
	
	sideBarStateChange(event){
		if(event.detail.state === 'open'){
			jQuery('html').addClass('sideBarOpen');						
		}
		else{
			jQuery('html').removeClass('sideBarOpen');
		}
	},
	
	setScreenSize(event){
		PepOpenCatalogUtils.setScreenSize(event.detail.name, pepListItems.setSmartFilterDomLocation);	
	},
	
	smartFilterChange(event){
		var whereQuery = pepListItems.getWhereQuery({categoryUUID: [pepListItems.elMenu.selectedItem.key], filters:event.detail});										   							    	    pepListItems.elSmartFilter.filters = event.detail;		 
		pepListItems.clearLocalItems();			
		pepListItems.getItems({getItemsCallback: {function:pepListItems.getItemsFromEventTrigeredCallback}, getFiltersCallback: {function:pepListItems.getFiltersCallback}}, {where:whereQuery, search_string: pepListItems.lastSearchKeyword/*pepListItems.elSearch.value*/, page_size: pepListItems.apiItemsBulkSize, order_by: pepListItems.elSort.currentSorting.sortBy});  
	},	
	
	search(event)	{
		//pepListItems.elMenu.selectedItem = 	{children: [], key: "", path: [""], text: "Categories"};
		pepListItems.lastSelectedCategory = pepListItems.elMenu.selectedItem;
		if(event.detail.value == ''){							  																				
			pepListItems.elSearch.value = pepListItems.lastSearchKeyword;
			return;	
		}else{
			pepListItems.elMenu.selectedItem = 	{children: [], key: "", path: [""], text: "Categories"};
			pepListItems.lastSelectedCategory = pepListItems.elMenu.selectedItem;
		}
		pepListItems.lastSearchKeyword = event.detail.value;
		pepListItems.elSmartFilter.clearFilters();									
		pepListItems.elSmartFilter.fields.forEach( field => {field.isOpen = false;});//close fields when switch category
		var whereQuery = pepListItems.getWhereQuery({categoryUUID: [pepListItems.elMenu.selectedItem.key], filters:pepListItems.elSmartFilter.filters});
		PepOpenCatalogUtils.setBreadCrumbs(event.detail.value == '' ? pepListItems.elMenu.selectedItem.path : 	[pepListItems.searchResultsPattern.replace('{{searchValue}}',event.detail.value)], pepListItems.elBreadCrumbs); 																  
		pepListItems.elSearch.value = event.detail.value; 									
		pepListItems.clearLocalItems();			
		pepListItems.getItems({getItemsCallback: {function:pepListItems.getItemsFromEventTrigeredCallback}, getFiltersCallback: {function:pepListItems.getFiltersCallback}}, {where:whereQuery, search_string: event.detail.value, page_size: pepListItems.apiItemsBulkSize, order_by: pepListItems.elSort.currentSorting.sortBy}); 
	},
		
	menuItemClick(event)	{
		if((pepListItems.output.pluginSettings.pages.pep_categories_behavior !== 'all_categories' && event.detail.source.children.length > 0) || 
		   (pepListItems.output.pluginSettings.pages.pep_categories_behavior === 'all_categories' && event.detail.source.children.length > 0 && pepListItems.screenSize === 'xs'))
			//not supported in phablets DI-17984
		{	
			if(pepListItems.lastSelectedCategory){
				pepListItems.elMenu.selectedItem = pepListItems.lastSelectedCategory;                                    									
			}else{
				pepListItems.elMenu.selectedItem = pepListItems.elMenu.items[0];
			}
			return;																																			 
	    }
		pepListItems.elSearch.initSearch(); 
		pepListItems.lastSearchKeyword = '';
		pepListItems.elSmartFilter.clearFilters();									
		pepListItems.elSmartFilter.fields.forEach( field => {field.isOpen = false;});//close fields when switch category									
		pepListItems.clearLocalItems();
		pepListItems.elMenu.selectedItem = event.detail.source;  
		pepListItems.lastSelectedCategory = pepListItems.elMenu.selectedItem;
		PepOpenCatalogUtils.setBreadCrumbs(event.detail.source.path, pepListItems.elBreadCrumbs); 
		var whereQuery = pepListItems.getWhereQuery({categoryUUID: [event.detail.source.key]});											
		pepListItems.getItems({getItemsCallback: {function:pepListItems.getItemsFromEventTrigeredCallback}, getFiltersCallback: {function:pepListItems.getFiltersCallback}}, in_options = {where:whereQuery, search_string: pepListItems.elSearch.value, page_size: pepListItems.apiItemsBulkSize, order_by: pepListItems.elSort.currentSorting.sortBy});
	},
	
	viewChange(event)	{
		    pepListItems.elViews.currentView= event.detail.source;					
			pepListItems.sliceListItems();									
			var control = PepOpenCatalogUtils.getControlByScreenSize(pepListItems.output.data_configuration.DataViews,pepListItems.elViews.currentView.apiName,pepListItems.screenSize),
            	res = PepOpenCatalogUtils.dataConvertor(control,pepListItems.output.data, {currentView: pepListItems.elViews.currentView});	 					       	
       		pepListItems.elList.initListData(res.data_view, pepListItems.output.data.TotalCount, res.data, pepListItems.elViews.currentView.key);
	},
	
	sortChange(event){
			var whereQuery = pepListItems.getWhereQuery({categoryUUID: [pepListItems.elMenu.selectedItem.key], filters:pepListItems.elSmartFilter.filters});	
			pepListItems.elSort.currentSorting = event.detail.source;			
			pepListItems.clearLocalItems();									
			pepListItems.getItems({getItemsCallback: {function:pepListItems.getItemsFromEventTrigeredCallback}, getFiltersCallback: {function:null, params:null}}, {where:whereQuery, order_by: event.detail.source.sortBy, page_size: pepListItems.apiItemsBulkSize, search_string:pepListItems.lastSearchKeyword/*pepListItems.elSearch.value*/}); 
	},
	
	loadListPage(event)	{
		 //'page changed fired, call api to get next bulk and update list, page index:  ' + event.detail.pageIndex + ' page size: ' + event.detail.pageSize; 
		var start = pepListItems.output.pluginSettings.pages.pep_item_per_page_key * event.detail.pageIndex,
			end = start + event.detail.pageSize,
			apiPage = parseInt((pepListItems.output.pluginSettings.pages.pep_item_per_page_key * event.detail.pageIndex) / pepListItems.apiItemsBulkSize) + 1;	
		
		if(apiPage * pepListItems.apiItemsBulkSize > 10000){//api limit of max 10000 items
		    alert('Result window is too large, from + size must be less than or equal to: 10000 but was ' + apiPage * pepListItems.apiItemsBulkSize);			
			pepListItems.elList.pageIndex = 0;
			pepListItems.updateListPage();
			return;
		}

		if(typeof pepListItems.pepItems[start] !== 'undefined') {

			if (typeof pepListItems.pepItems[end] !== 'undefined') {
				//items with all range already exist in local array no need to server request 
				//PepOpenCatalogUtils.showLoader('rightContainer');
				//setTimeout(() => {PepOpenCatalogUtils.hideLoader('rightContainer');}, 700);								
				pepListItems.updateListPage();
				return; 
			} else {
				apiPage += 1; // Increment server page in one cause it's the border items that missing 
			}
		}		

		var whereQuery = pepListItems.getWhereQuery({categoryUUID: [pepListItems.elMenu.selectedItem.key], filters:pepListItems.elSmartFilter.filters});
		pepListItems.getItems({getItemsCallback: {function: pepListItems.updateListPage, params: apiPage-1},getFiltersCallback: {function:null, params:null}}, {where:whereQuery, search_string: pepListItems.lastSearchKeyword/*pepListItems.elSearch.value*/, order_by: pepListItems.elSort.currentSorting.sortBy, page_size: pepListItems.apiItemsBulkSize, page: apiPage});	

	},
	
	itemListClick(event)	{
		window.sessionStorage.setItem("ItemsParams",  JSON.stringify({SortState: pepListItems.elSort.currentSorting, ViewState: pepListItems.elViews.currentView, FiltersState: {filters: pepListItems.elSmartFilter.filters, fields:pepListItems.elSmartFilter.fields} ,CategoryUUID: pepListItems.elMenu.selectedItem, search_string: pepListItems.lastSearchKeyword/*pepListItems.elSearch.value*/, pager: {pageSize: pepListItems.apiItemsBulkSize, pageIndex: pepListItems.elList.pageIndex }}));																   
		window.location.href =  pepListItems.output.pluginSettings.pages.pep_itemdetails_page_url + "?uuid=" +  event.detail.source.UID;   
	},
		
    getItemsCallback(data)	{	
        pepListItems.output.data = data;
		pepListItems.initList();	
        //pepListItems.initComponents();
    },
    
	getItemsFromEventTrigeredCallback(data){
		pepListItems.output.data = data;
		pepListItems.initList();
	},				
		
	getFiltersCallback(data, filtersState = null){ 
       	var arr = [],  arrOptions, currentItem, uiFilterType={}, openField,			
			smartsearch_control = PepOpenCatalogUtils.getControlByScreenSize(pepListItems.output.data_configuration.DataViews,"SmartSearch", pepListItems.screenSize);
		
        jQuery.each(smartsearch_control.Fields, function(index, item) {	 
				  arrOptions = [], 
				  currentItem = data.find(({ APIName}) => APIName === item.FieldID );
			if(currentItem.Values.length > 0)	 {
				    jQuery.each(currentItem.Values, function(_index, value) {					  
					   arrOptions.push({value: value.key.toString(), count: value.doc_count });							  
				   });												

					uiFilterType = PepOpenCatalogUtils.getFilterType(item);	
					var operators;
					if(uiFilterType.ComponentType == "date"){//display one option for date & datetime types in the combobox (ori milo)
						operators = ["dateRange"];
					}			

					if(pepListItems.elSmartFilter.fields.length > 0 ){//leave field open or close				
						openField = pepListItems.elSmartFilter.fields.find( field => field.isOpen === true && field.id == item.FieldID);				
					}

					arr.push({id: item.FieldID, name:item.Title, componentType: uiFilterType.ComponentType , type: uiFilterType.Type , options: arrOptions, operators: operators, isOpen: typeof(openField) != 'undefined' ? openField.isOpen : false});//date, number, boolean								
			}
        });			
															
		pepListItems.elSmartFilter.fields = arr;
		
		if(filtersState && filtersState.filters){//back from product details, should display filters state as before
			pepListItems.elSmartFilter.filters = filtersState.filters;
			if(filtersState.fields){
					pepListItems.elSmartFilter.fields.forEach( field => 															  
					  { fieldState = filtersState.fields.find( filtersState_field => field.id == filtersState_field.id);
						field.isOpen = fieldState && typeof(fieldState.isOpen) != 'undefined' ? fieldState.isOpen : false ;});
			}
		}
		
    },    
	
	setSmartFilterDomLocation(size){					
		var elSideBar =  jQuery('pep-side-bar');	
		var elSmartFilter =  jQuery('pep-smart-filters');
		var pepHeader = jQuery('.pepHeader');
		
		if(size == 'xs' || size == 'is-4' || size == 'sm' || size == 'is-3'){			
			if(elSideBar.find('.side-bar-container').find('pep-smart-filters').length == 0){	
				
				if(pepHeader.length > 0)
				{				  
			       jQuery(elSideBar).find('.mat-sidenav-container').css('top',pepHeader.offset().top + 'px');
				}	
				
				jQuery(elSmartFilter).appendTo(jQuery(elSideBar).find('.sidenav-main')); 				
			}
		}
		else{
			if(pepHeader.length > 0)
			{				  
			       jQuery(elSideBar).find('.mat-sidenav-container').css('top', '0px');
			}	
			
			jQuery(elSmartFilter).insertAfter(jQuery(elSideBar).find('.side-bar-container'));
			pepListItems.elSideBar.close();	
		}
	},
		
    getTokenCallback(data)	{	 
            if(data.success){
                pepListItems.output.pluginSettings = PepOpenCatalogUtils.getPluginSettings();
                pepListItems.output.data = JSON.parse(data.output);                 			
                pepListItems.pepperi_token = data.token.access_token; 
				if(data.refreshConfig){
					pepListItems.output.data_configuration = data.configuation;  
				}else{//get the old configuration from session
					pepListItems.output.data_configuration = JSON.parse(window.sessionStorage.getItem("pep_config")).output.data_configuration;	
				}					
				window.sessionStorage.setItem("pep_config",  JSON.stringify({pepperi_token: pepListItems.pepperi_token , output: pepListItems.output}));
                pepListItems.init();			
            }
            else{
                //todo                
				var result = confirm( data.error.message + " .Click Ok to reload or Cancel to Continue." );
				if ( result ) {
				   window.location.reload();
				} 
            }
        },
    };        
   
    
    // leak into global namespace
    window.pepListItems = pepListItems;
	window.pepListItems.start(window.pepListItems);	
    
    })();