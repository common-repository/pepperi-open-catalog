(function() {
    
 
    var pepOCcarousel = {
             __proto__: window.pepComponents,            
            elCarousel : null, 
			elSizeDetect: null,			
    
            init(){ 
				this.elSizeDetect = document.querySelector('pep-size-detect');				    			
				this.screenSize = this.elSizeDetect.getCurrentSize().name;		
                this.elCarousel = jQuery('pep-web-carousel'); 
				if(this.elCarousel.length == 0)
					return;
                this.getItems(pepOCcarousel.getItemsCallback);   	
                this.addEvents();
    
            },	       
    
            addEvents(){				
				jQuery.each(this.elCarousel, function(index, item) {    
								                item.addEventListener('itemClick', (function(event){ 
													window.sessionStorage.removeItem("ItemsParams");
													window.location.href =  pepOCcarousel.output.pluginSettings.pages.pep_itemdetails_page_url + "?uuid=" +  event.detail.source.UID;															                                                								}));	                                                 			
							});                
            },
    
            initComponents(){ 
				var currentView = PepOpenCatalogUtils.getControlByScreenSize(this.output.data_configuration.DataViews,"OrderViewsMenu", this.screenSize).Fields[0].FieldID,                
                    control =   PepOpenCatalogUtils.getControlByScreenSize(this.output.data_configuration.DataViews,currentView,this.screenSize),				
				    res = PepOpenCatalogUtils.dataConvertor(control,pepOCcarousel.output.data.value),	                									
				    carousel = pepOCcarousel.elCarousel.filter(function(val){ return jQuery(this).attr("data-carousel-name") == pepOCcarousel.output.data.name;});	
				carousel[0].layout = res.data_view;            									
				carousel[0].itemSize = carousel.attr("data-carousel-size");//'md' is default in html.php file;			
				carousel[0].items = res.data;	
				carousel[0].duration = 500;
				carousel[0].itemsToMove = pepOCcarousel.output.pluginSettings.pages.pep_carousel_behavior == 'page' ? this.getCarouselScrollitems(carousel[0]) : 1;
				
				
            },              
        	
			getCarouselScrollitems(carouselObj){
				//carousel size  'xs' | 'sm' | 'md';							
				//lg, xs=5 sm=4 md=3 items						 
				//xl: xs=7 sm=6 md=4 items						 
			 	//md: xs=4 sm=3 md=3 items							
			 	//sm: xs=2 sm=2 md=2 items							
				//xs: xs=sm=md=1 item
				var scrollItems = 7;
				switch(carouselObj.itemSize){
					case 'xs':
						if(pepOCcarousel.screenSize == 'xl'){
							scrollItems = 7;
						}else if(pepOCcarousel.screenSize == 'lg'){
							scrollItems = 5;
						}else if(pepOCcarousel.screenSize == 'md'){
							scrollItems = 4;
						}else if(pepOCcarousel.screenSize == 'sm'){
							scrollItems = 2;
						}else{//xs
							scrollItems = 1;
						}
						break;
					case 'sm':
						if(pepOCcarousel.screenSize == 'xl'){
							scrollItems = 6;
						}else if(pepOCcarousel.screenSize == 'lg'){
							scrollItems = 4;
						}else if(pepOCcarousel.screenSize == 'md'){
							scrollItems = 3;
						}else if(pepOCcarousel.screenSize == 'sm'){
							scrollItems = 2;
						}else{//xs
							scrollItems = 1;
						}
						break;
					case 'md':
						if(pepOCcarousel.screenSize == 'xl'){
							scrollItems = 4;
						}else if(pepOCcarousel.screenSize == 'lg'){
							scrollItems = 3;
						}else if(pepOCcarousel.screenSize == 'md'){
							scrollItems = 3;
						}else if(pepOCcarousel.screenSize == 'sm'){
							scrollItems = 2;
						}else{//xs
							scrollItems = 1;
						}
						break;
					default: //md	
						if(pepOCcarousel.screenSize == 'xl'){
							scrollItems = 4;
						}else if(pepOCcarousel.screenSize == 'lg'){
							scrollItems = 3;
						}else if(pepOCcarousel.screenSize == 'md'){
							scrollItems = 3;
						}else if(pepOCcarousel.screenSize == 'sm'){
							scrollItems = 2;
						}else{//xs
							scrollItems = 1;
						}
						break;						
				}				
				return scrollItems;				
			},
		
         	getItems(callback, options = {}){               			 				
				
				jQuery.each(pepOCcarousel.elCarousel, function(index, item) {    
						var apiRequests = []; 											
                    	carouselApiRequest = pepOCcarousel.output.pluginSettings.advanced.CarouselConfig.find(({ name}) => name === jQuery(item).attr('data-carousel-name') );
                     	if(typeof carouselApiRequest != 'undefined' && carouselApiRequest){
									apiRequests.push({pep_url:decodeURIComponent(carouselApiRequest.value), pep_data_url: {}, pep_request_type: 'GET', pep_request_callback:callback, pep_request_callbackParams: {name: carouselApiRequest.name} ,pep_request_headers: function (xhr) {
													xhr.setRequestHeader('Authorization', 'Bearer ' + pepOCcarousel.pepperi_token)}
								 });
							
							PepOpenCatalogUtils.pepApiCall(apiRequests);		                 
						}
                });										                        
			 
			  //PepOpenCatalogUtils.pepApiCall(apiRequests);		                 
            },				
        
        getItemsCallback(data, callbackParams)	{	
            pepOCcarousel.output.data = {name: callbackParams.name,  value: data};
            pepOCcarousel.initComponents();
        },    	
        
       getTokenCallback(data){                
             if(data.success){
                    pepOCcarousel.output.pluginSettings = PepOpenCatalogUtils.getPluginSettings();
                    pepOCcarousel.output.data = JSON.parse(data.output);                                                            
				  	pepOCcarousel.pepperi_token = data.token.access_token;
				    if(data.refreshConfig){
                    	pepOCcarousel.output.data_configuration = data.configuation;                              
					}else{//get the old configuration from session
						pepOCcarousel.output.data_configuration = JSON.parse(window.sessionStorage.getItem("pep_config")).output.data_configuration;	
					}		
					window.sessionStorage.setItem("pep_config",  JSON.stringify({pepperi_token: pepOCcarousel.pepperi_token , output: pepOCcarousel.output}));
					pepOCcarousel.init();			
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
    window.pepOCcarousel = pepOCcarousel;
	window.pepOCcarousel.start(window.pepOCcarousel);	
    
    })();