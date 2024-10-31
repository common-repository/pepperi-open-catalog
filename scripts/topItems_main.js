(function() {
    
 
    var pepTopItems = {
			__proto__: window.pepComponents,                        
            elSearch : 	null,            
            elMenu : null,
            elFilterMenuButton : null,
			elSizeDetect: null, 
			lastSelectedCategory: null,
		
            init(){ 	
				
				 super.init({ 
					 		objectName: pepTopItems, components: [
					 		{propName:'elSearch', htmName:'pep-web-search', events: [{eventName:'stateChange',eventCallback: window.PepOpenCatalogUtils.changeTopbarElements}, {eventName:'search', eventCallback:pepTopItems.search}]},
							{ propName:'elMenu', htmName:'pep-web-menu', events: [{eventName:'menuItemClick' ,eventCallback:pepTopItems.menuClick }]},
							{ propName:'elSizeDetect', htmName:'pep-size-detect', events: [{eventName: 'sizeChange',eventCallback: pepTopItems.setScreenSize}]},
						    { propName:'elFilterMenuButton', htmName:'#pep-filter-menu',  events: null}
				            ]
				 		  });				

				this.screenSize = this.elSizeDetect.getCurrentSize().name;		                
				this.initComponents();
    
            },	           		
		
            initComponents(){
            	
				PepOpenCatalogUtils.setScreenSize(this.elSizeDetect.getCurrentSize().name);
                this.elFilterMenuButton.iconName = 'system_menu';              
										
				super.initComponents({Object_name:pepTopItems , components:[{componentName:'pep-web-menu', iconName:'arrow_down', type:'action-select', styleType: 'regular'}]});       
                pepTopItems.elMenu.selectedItem = {children: [], key: "", path: [""], text: "Categories"};
				pepTopItems.lastSelectedCategory = pepTopItems.elMenu.selectedItem;
            },         
       
			search(event){
				if(event.detail.value == '')							  																				
					return;	

				pepTopItems.elSearch.value = event.detail.value; 
				window.sessionStorage.setItem("ItemsParams",  JSON.stringify({CategoryUUID: {children: [],key: "",path: [],text: "Categories"}, search_string: event.detail.value}));
				window.location.href =  pepTopItems.output.pluginSettings.pages.pep_opencatalog_page_url;
			},
			
		    menuClick(event) {
				if((pepTopItems.output.pluginSettings.pages.pep_categories_behavior !== 'all_categories' && event.detail.source.children.length > 0) ||
				   (pepTopItems.output.pluginSettings.pages.pep_categories_behavior === 'all_categories' && event.detail.source.children.length > 0 && pepTopItems.screenSize === 'xs'))
				   //not supported in phablets DI-17984
				{
					if(pepTopItems.lastSelectedCategory){
						pepTopItems.elMenu.selectedItem = pepTopItems.lastSelectedCategory;                                    									
					}else{
						pepTopItems.elMenu.selectedItem = pepTopItems.elMenu.items[0];
					}
					return;		
				}														
				pepTopItems.elMenu.selectedItem = event.detail.source;	
				window.sessionStorage.setItem("ItemsParams",  JSON.stringify({CategoryUUID: event.detail.source, search_string: pepTopItems.elSearch.value}));
				window.location.href =  pepTopItems.output.pluginSettings.pages.pep_opencatalog_page_url;
				
			},
		
			setScreenSize(event){
				PepOpenCatalogUtils.setScreenSize(event.detail.name);	
			},
		
            getTokenCallback(data){                
				 if(data.success){
						pepTopItems.output.pluginSettings = PepOpenCatalogUtils.getPluginSettings();
						pepTopItems.output.data = JSON.parse(data.output);                                        
						pepTopItems.pepperi_token = data.token.access_token; 
						if(data.refreshConfig){
							pepTopItems.output.data_configuration = data.configuation;                              
						}else{//get the old configuration from session
							pepTopItems.output.data_configuration = JSON.parse(window.sessionStorage.getItem("pep_config")).output.data_configuration;	
						}	
						window.sessionStorage.setItem("pep_config",  JSON.stringify({pepperi_token: pepTopItems.pepperi_token , output: pepTopItems.output}));
						pepTopItems.init();				
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
    window.pepTopItems = pepTopItems;	
	window.pepTopItems.start(window.pepTopItems);	
    
    })();