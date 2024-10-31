let pepComponents = {
    
	papiApiDomain: 'https://papi.pepperi.com/V1.0',
    output : {pluginSettings: null, data_configuration: null, data: null}, 
	pepperi_token: null, 	
	screenSize: 'xl',	
	
    init(in_object) {					
		
			jQuery.each(in_object.components, function(index, single_component) {					
				in_object.objectName[single_component.propName] = document.querySelector(single_component.htmName);	
				jQuery.each(single_component.events, function(_index, single_event) {	
					in_object.objectName[single_component.propName].addEventListener(single_event.eventName, (function(event){					
						single_event.eventCallback(event);															   
					}));

				});	

			});				

    },
	
	start(_object){		 
		//GET PEPPERI TOKEN 						
		var encodedJWT = null, pep_config = JSON.parse(window.sessionStorage.getItem("pep_config"));												
		if(!pep_config || (typeof(pep_config.refreshToken) != 'undefined' && pep_config.refreshToken)){			
			 
			if(pep_config){
				encodedJWT = window.PepOpenCatalogUtils.parsePepperiJwt(pep_config.pepperi_token);					
			}
			
			window.PepOpenCatalogUtils.pepApiCall([ 
			 {pep_url:null, pep_data_url: { pepOC_url: 'https://idp.pepperi.com/api/AddonUserToken', 
											   pepOc_configuration: this.papiApiDomain + '/open_catalog/configurations', 
										       pep_addonkey: encodedJWT != null ? encodedJWT["pepperi.addonkey"] : '',
										       pep_session: pep_config != null ? true : false,
											   action: 'getPepToken' }, pep_request_type: 'POST', pep_request_callback:_object.getTokenCallback, pep_request_headers: null}], 'pep-open-catalog');  

		}else{		
			var pep_config = JSON.parse(window.sessionStorage.getItem("pep_config"));		 
			 this.output.pluginSettings = PepOpenCatalogUtils.getPluginSettings();
			 _object.pepperi_token = pep_config.pepperi_token;	
			 this.output.data = pep_config.output.data; 
			 this.output.data_configuration = pep_config.output.data_configuration;
			 _object.init();
		}
	},
	
	initComponents(in_object){
		
		jQuery.each(in_object.components, function(index, single_component) {									
			switch(single_component.componentName){
		   		case 'pep-web-menu':
					 var in_options = {iconName:'arrow_down', type:'action-select'};		                     
             		 jQuery.extend(single_component, in_options);//merge default option object into default object			
					 in_object.Object_name.elMenu.iconName = single_component.iconName; //'arrow_down';        
			 		 in_object.Object_name.elMenu.type = single_component.type;//'action-select'; 
					 in_object.Object_name.elMenu.styleType = single_component.styleType;//regular					
			         var categoryListArr = [];					
					 jQuery.each(pepComponents.output.data_configuration.CategoriesTree, function(_index, item) {    
						var listItem = PepOpenCatalogUtils.getCategoryItems(item);
						categoryListArr.push(listItem);
					 });			
					 in_object.Object_name.elMenu.items = categoryListArr;		
					 break;
				default: break;	
			}		
		 });						
	}

  };

  window.pepComponents = pepComponents;
    