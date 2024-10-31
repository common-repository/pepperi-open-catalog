<?php 
class PepOpenCatalogAjax {
   
	private $result =  null;

    function __construct() {                        
        $this->result = array('success' => true, "error" => null, 'token' => null, 'output' => null, 'settings' => null, 'configuation' => null, 'refreshConfig' => false);
		//$this->result = (object)['success' => true, "error" => null, 'token' => null, 'output' => null, 'settings' => null, 'configuation' => null, 'refreshConfig' => false];
        //both needed to run ajax action
        add_action('wp_ajax_nopriv_getPepToken', array($this, 'getPepToken') );
        add_action('wp_ajax_getPepToken', array($this, 'getPepToken') );  				
    }

    public function getPepToken() {   
	  //These urls are our company (Pepperi) API urls, trusted urls, and will never change or contains any dangerous query string params that can crash the plugin	
	  //That is why i did not escape it in the prev version
	  
	  //https://idp.pepperi.com/api/AddonUserToken --> pepOC_url
	  //https://papi.pepperi.com/V1.0/open_catalog/configurations --> pepOc_configuration
      $pepOC_url = esc_url(wp_strip_all_tags($_POST['pepOC_url']));  
      $pepOc_configuration_url = esc_url(wp_strip_all_tags($_POST['pepOc_configuration'])); 
	  $pep_addonkey = wp_strip_all_tags($_POST['pep_addonkey']);
	  $pep_session = wp_strip_all_tags($_POST['pep_session']);	
		
	  //get secret key from settigs
	  $pepOc_Options =  get_option('pep_opencatalog_options');				  		  
      $pepOC_url = $pepOC_url . "?key=" . $pepOc_Options['general']['pep_secret_key'] ;
	  $httpArgs = array('method' => 'GET', 'headers' => array(),'body' => null);					     	                
      
      //get access token while sending the secret key
       $output = $this->httpRequest($httpArgs,$pepOC_url);			    		 		 	   			        
		
       if($this->result["success"]){			   
		   $this->result["token"] = json_decode($output);  		   		   		   		   
		   $decodedToken =  json_decode(base64_decode(str_replace('_', '/', str_replace('-','+',explode('.', $this->result["token"]->access_token)[1]))));		     		   		   		   		   
		   //compare old token addonkey with new token, if equals, do not trigger a request to get configuration_url		   
		   if((!hash_equals($decodedToken->{'pepperi.addonkey'}, $pep_addonkey)) || !$pep_session)		   
		   {		   
			   //Get customer data configuration json file each time we are getting a new access token
			   $httpArgs = array('method' => 'GET', 'headers' => array('Authorization' => 'Bearer ' . $this->result['token']->access_token),'body' => null);						
			   $output = $this->httpRequest($httpArgs,$pepOc_configuration_url);	

			   if($this->result["success"]){
					$configuration_object = $this->httpRequest($httpArgs,json_decode($output)->ConfigurationsURL);	
					if($this->result["success"]){
						$this->result['configuation'] = json_decode($configuration_object);  
						$this->result['refreshConfig'] = true;
					}

				}			
	   	  }
		}	  
		
		echo json_encode($this->result);	  
        die();
      
	}	
	
   private function httpRequest($args, $endpoint) {
	  	  
	  $url = $endpoint; 
	 
	  $args['timeout'] = 30;

	  //Make the call and store the response in $res
	  $res = wp_remote_request($url, $args);

	  //Check for success
	  if(!is_wp_error($res) && ($res['response']['code'] == 200 || $res['response']['code'] == 201)) {
		return $res['body'];
	  }
	  else {
		$this->result["success"] = false; 
		$this->result["error"] = $res['response'];  		  
		return null;
	  }
  }

}

$pepOpenCatalogAjax = new PepOpenCatalogAjax();
?>