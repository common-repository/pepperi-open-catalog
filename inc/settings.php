<?php
class PepOpenCatalogSettings
{
    /**
     * Holds the values to be used in the fields callbacks
     */
    private $options;

    /**
     * Start up
     */
	
	function page_tabs( $current = 'first' ) {
		$tabs = array(
			'general'   => __( 'General', 'plugin-textdomain' ), 
			'pages'  => __( 'Pages', 'plugin-textdomain' ),
			'advanced'  => __( 'Advanced', 'plugin-textdomain' ),
			
		);
		$html = '<h2 class="nav-tab-wrapper">';
		foreach( $tabs as $tab => $name ){
			$class = ( $tab == $current ) ? 'nav-tab-active' : '';
			$html .= '<a class="nav-tab ' . $class . '" href="?page=PepperiOpenCatalogSettings&tab=' . $tab . '">' . $name . '</a>';
		}
		$html .= '</h2>';
		echo $html;
	}
	
    public function __construct()
    {
		// get_stylesheet_directory_uri() instead of get_template_directory_uri()
     	add_action('admin_enqueue_scripts',array($this,'load_style'));
		
		 //wp_enqueue_style( 'custom-fa', 'https://use.fontawesome.com/releases/v5.0.6/css/all.css' );
		//wp_enqueue_style( 'pepOpenCatalogCss_Id', plugin_dir_url( __FILE__ ) .  '../styles/plugin.css', false,  'all' );		 

		add_action( 'wp_enqueue_scripts', array($this, 'pepOpenCatalogSettings_styles'));		
		add_action('admin_enqueue_scripts', array($this, 'pepOpenCatalogSettings_styles'));	

		add_filter( 'plugin_action_links_PepperiOpenCatalog/wp-pepOpenCatalog.php', array($this, 'nc_settings_link') );  
		add_action( 'admin_menu', array( $this, 'add_plugin_page' ) );
		
		register_setting(
            'my_option_group', // Option group
            'pep_opencatalog_options', // Option name
            array( $this, 'sanitize' ) // Sanitize
        );
		
		add_action( 'admin_init', array( $this, 'generalTabInit' ) );
		add_action( 'admin_init', array( $this, 'pagesTabInit' ) );
        add_action( 'admin_init', array( $this, 'advancedTabInit' ) );
		
    }
	
	function load_style() {
        wp_register_style( 'admin_css', get_template_directory_uri() . '/admin-style.css', false, '1.0.0' );
	}

	function pepOpenCatalogSettings_styles()
	{
		wp_enqueue_style( 'custom-fa_pepSettings', 'https://use.fontawesome.com/releases/v5.0.6/css/all.css', array(), '1.0.2', 'all' );		
		wp_enqueue_style( 'pepOpenCatalogCssSettings_Id', plugin_dir_url( __FILE__ ) . '../styles/plugin.css', array(), '1.0.2', 'all' ); 								
	}

	// This function add the settings page link to the plugin page
	function nc_settings_link( $links ) {
        // Build and escape the URL.
        $url = esc_url( add_query_arg(
            'page',
            'PepperiOpenCatalogSettings',
            get_admin_url() . 'admin.php'
        ) );
        // Create the link.
        $settings_link = "<a href='$url'>" . __( 'Settings' ) . '</a>';
        // Adds the link to the end of the array.
        array_push(
            $links,
            $settings_link
        );
        return $links;
    }
    /**
     * Add options page
     */
    public function add_plugin_page()
    {
        // This page will be under "Settings"
        add_options_page(
            'Pepperi Open Catalog', 
            'Pepperi Open Catalog', 
            'manage_options', 
            'PepperiOpenCatalogSettings', 
            array( $this, 'create_admin_page' )
        );
    }

    /**
     * Options page callback
     */
    public function create_admin_page()
    {
        // Set class property
        
        $this->options = get_option( 'pep_opencatalog_options' );
        ?>
        <div class="wrap">
            <h1>Open catalog settings</h1>
            <form method="post" action="options.php">
            <?php
		
             // This prints out all hidden setting fields
                settings_fields( 'my_option_group' );
		
				$tab = ( ! empty( $_GET['tab'] ) ) ? esc_attr( $_GET['tab'] ) : 'general';
				$this->page_tabs( $tab );
		
				if ( $tab == 'general' ) {
					printf('<div id="generalTab">');
						do_settings_sections( 'PepperiOpenCatalogSettings' );
					printf('</div>');
				}
				else if ( $tab == 'pages' ) {
					printf('<div id="pagesTab">');
						do_settings_sections( 'Pepperi_OC_Pages_Settings' );
					printf('</div>');
				}
				else if ( $tab == 'advanced' ) {
						printf('<div onclick="clickOutOfTable(event);" id="AdvancedTab">');
					
					do_settings_sections( 'Pepperi_OC_Advanced_Settings' );	
					
					printf('</div>');
					
				}
				// Code after the tabs (outside)
		
                //do_settings_sections( 'PepperiOpenCatalogSettings' );
                submit_button();
            ?>
            </form>
			<?php
   
        echo "
            <script type=\"text/javascript\">
				var selectedRow = -1;
           		
				function deleteRequestTableRow(elem){
					var row = jQuery(elem).parents('.advancedTableRow');
					var id = parseInt(jQuery(row).attr('id').replace('row_',''));
					
					jQuery('#row_'+id).remove();
					
					var table = jQuery('#advancedRequestTable tbody');
					var rows = table.find('tr');
					
					for(var i=0 ; i < rows.length ; i++){
						jQuery(rows[i]).attr('id','row_'+i);
						jQuery(rows[i]).find('input[type=text]').attr('name','pep_opencatalog_options[advanced][CarouselConfig]['+i+'][name]');
						jQuery(rows[i]).find('textarea').attr('name','pep_opencatalog_options[advanced][CarouselConfig]['+i+'][request]');
					}
					
					
				}
				function editRequestTableRow(elem){
					var row = jQuery(elem).parents('.advancedTableRow');
					var id = parseInt(jQuery(row).attr('id').replace('row_',''));
					
					if(id !== selectedRow && selectedRow !== -1){
						jQuery('#row_'+selectedRow).addClass('disableRow');
						jQuery('#row_'+selectedRow).find('#row_'+selectedRow+'_request').prop('readonly', true);
						jQuery('#row_'+selectedRow).find('#row_'+selectedRow+'_name').prop('readonly', true);
					}
					
					row.removeClass('disableRow');
					row.find('#row_'+id+'_request').prop('readonly', false);
					row.find('#row_'+id+'_name').prop('readonly', false);
					
					selectedRow = id;
				}
				
				function clickOutOfTable(event){
				if(jQuery(event.srcElement).parents('#row_'+selectedRow).length > 0 ){
					return false;
				}
					var row = jQuery('#row_'+selectedRow);
					if(row.length > 0){ 
						row.addClass('disableRow');
						row.find('#row_'+selectedRow+'_request').prop('readonly', true);
						row.find('#row_'+selectedRow+'_name').prop('readonly', true);
						selectedRow = -1;
					}
				}
				
				function add_advanced_requests_Table_row(){
					var key;
					var table = jQuery('#advancedRequestTable tbody');
					var rows = table.find('tr');
					var lastTR = rows.last();
					
					if(lastTR.length == 0){
						key = 0;
					}else{
					   key = parseInt(jQuery(lastTR).attr('id').replace('row_','')) + 1;
					}
					
					var trHTML = '<tr id=\"row_'+key+'\" class=\"advancedTableRow disableRow\">'+
					'<td><input readonly=\"true\" type=\"text\" id=\"row_'+key+'_name\" name=\"pep_opencatalog_options[advanced][CarouselConfig]['+key+'][name]\" value=\"\"></td>'+
					'<td><textarea readonly=\"true\" id=\"row_'+key+'_request\" name=\"pep_opencatalog_options[advanced][CarouselConfig]['+key+'][request]\"></textarea></td>'+
					'<td><i onclick=\"editRequestTableRow(this);\" class=\"fas fa-pencil-alt\"></i><i onclick=\"deleteRequestTableRow(this);\" class=\"fas fa-trash-alt\"></i></td>'+
					'</tr>';
					var newHtml = table.html() + trHTML;
					table.html(newHtml);
					
	}
            </script>
        ";
     
  ?>
        </div>
        <?php
    }

public function advancedTabInit(){
	add_settings_section('OC_Advanced','User Defined Requests&nbsp<button type="button" class="btnAddNew button" onclick="add_advanced_requests_Table_row();"><span>Add new</span> <i class="fas fa-plus"></i></button>',array( $this,'printSecondaryTitle'),'Pepperi_OC_Advanced_Settings');  
 
	add_settings_field('pep_oc_advanced_requests', '', array( $this, 'advanced_requests_callback' ), 'Pepperi_OC_Advanced_Settings', 'OC_Advanced'); 
	
}
	
public function pagesTabInit(){
		
	add_settings_section('OC_Pages','Page Setup',array( $this, 'printSecondaryTitle'),'Pepperi_OC_Pages_Settings'); 
 
	add_settings_field('pep_topitems_page_url', 'Home Page', array( $this, 'top_items_page_callback' ), 'Pepperi_OC_Pages_Settings', 'OC_Pages'); 
	
	add_settings_field('pep_opencatalog_page_url', 'Products Page', array( $this, 'open_catalog_page_callback' ), 'Pepperi_OC_Pages_Settings', 'OC_Pages'); 
	
	add_settings_field('pep_itemdetails_page_url', 'Product Information Page', array( $this, 'pep_itemdetails_callback' ), 'Pepperi_OC_Pages_Settings', 'OC_Pages'); 
	
	add_settings_section('OC_Configuration','Product List Configuration', array( $this, 'printSecondaryTitle'),'Pepperi_OC_Pages_Settings');  
	
	 add_settings_field('pep_item_per_page_key', '# of Product Per Page', array( $this, 'items_per_page_callback'), 'Pepperi_OC_Pages_Settings', 'OC_Configuration'); 
	
	add_settings_section('OC_Categories_Configuration','<br/><br/>Categories Configuration', array( $this,'printSecondaryTitle' ), 'Pepperi_OC_Pages_Settings');  
	
	add_settings_field('pep_categories_behavior', 'Categories Selection Behavior', array( $this,'categories_behavior_callback' ), 'Pepperi_OC_Pages_Settings', 'OC_Categories_Configuration'); 
	
	add_settings_section('OC_Carousel_Configuration','<br/><br/>Carousel Configuration', array( $this,'printSecondaryTitle' ), 'Pepperi_OC_Pages_Settings');  
	
	add_settings_field('pep_carousel_behavior', 'Carousel Scrolling Behavior', array( $this, 'carousel_behavior_callback'), 'Pepperi_OC_Pages_Settings', 'OC_Carousel_Configuration'); 
}
	
	
	
public function generalTabInit() 
    {        
       
	add_settings_section(
            'OC_API_Key', // ID
            'Open Catalog API Key', // Title
            array( $this, 'print_section_info' ), // Callback
            'PepperiOpenCatalogSettings' // Page
        );  

        add_settings_field(
            'pep_secret_key', // ID
            'API Key', // Title 
            array( $this, 'pep_secret_key_callback' ), // Callback
            'PepperiOpenCatalogSettings', // Page
            'OC_API_Key' // Section           
        );  
	
    }
	
    /**
     * Sanitize each setting field as needed
     * @param array $input Contains all settings fields as array keys
     */
    public function sanitize($input)
    {
        $new_input = array();
		$options = get_option( 'pep_opencatalog_options' );
        
		$new_input['pep_api_token'] = isset( $input['pep_api_token']) ? $new_input['pep_api_token'] = sanitize_text_field($input['pep_api_token']) : $new_input['pep_api_token'] = $options['pep_api_token'];
		
		$new_input['general']['pep_secret_key'] = isset( $input['general']['pep_secret_key']) ? $new_input['general']['pep_secret_key'] = sanitize_text_field($input['general']['pep_secret_key']) : $new_input['general']['pep_secret_key'] = $options['general']['pep_secret_key'];
		
		$new_input['pages']['pep_item_per_page_key'] = isset( $input['pages']['pep_item_per_page_key']) ? $new_input['pages']['pep_item_per_page_key'] = (int)sanitize_text_field($input['pages']['pep_item_per_page_key']) : $new_input['pages']['pep_item_per_page_key'] = (int)$options['pages']['pep_item_per_page_key'];
		
		$new_input['pages']['pep_opencatalog_page_url'] = isset( $input['pages']['pep_opencatalog_page_url']) ? $new_input['pages']['pep_opencatalog_page_url'] = sanitize_text_field($input['pages']['pep_opencatalog_page_url']) : $new_input['pages']['pep_opencatalog_page_url'] = $options['pages']['pep_opencatalog_page_url'];
		
		$new_input['pages']['pep_topitems_page_url'] = isset( $input['pages']['pep_topitems_page_url']) ? $new_input['pages']['pep_topitems_page_url'] = sanitize_text_field($input['pages']['pep_topitems_page_url']) : $new_input['pages']['pep_topitems_page_url'] = $options['pages']['pep_topitems_page_url'];
		
		$new_input['pages']['pep_itemdetails_page_url'] = isset( $input['pages']['pep_itemdetails_page_url']) ? $new_input['pages']['pep_itemdetails_page_url'] = sanitize_text_field($input['pages']['pep_itemdetails_page_url']) : $new_input['pages']['pep_itemdetails_page_url'] = $options['pages']['pep_itemdetails_page_url'];
		
		$new_input['pages']['pep_categories_behavior'] = isset( $input['pages']['pep_categories_behavior']) ? $input['pages']['pep_categories_behavior'] == "all_categories" ? "all_categories" : "buttom_level" : $new_input['pages']['pep_categories_behavior'] = $options['pages']['pep_categories_behavior'];
		

		$new_input['pages']['pep_carousel_behavior'] = isset( $input['pages']['pep_carousel_behavior']) ? $input['pages']['pep_carousel_behavior'] == "page" ? "page" : "element" : $new_input['pages']['pep_carousel_behavior'] = $options['pages']['pep_carousel_behavior'];
		
		// TODO - NEED TO KNOW HOW MANY ROWS
	$new_input['advanced']['CarouselConfig'] = array();
		
	$key = 0;
	while(isset($input['advanced']['CarouselConfig'][$key]['name']) ||isset( $input['advanced']['CarouselConfig'][$key]['request'])){
			
		if(isset( $input['advanced']['CarouselConfig'][$key]['name']) || isset( $input['advanced']['CarouselConfig'][$key]['request'])){
						
			$name = sanitize_text_field($input['advanced']['CarouselConfig'][$key]['name']);
				//$request = sanitize_text_field($input['advanced']['CarouselConfig'][$key]['request']);								
				$request = rawurlencode($input['advanced']['CarouselConfig'][$key]['request']);	 
				//request = urlencode($input['advanced']['CarouselConfig'][$key]['request']);								
				
				$new_input['advanced']['CarouselConfig'][$key] = (object) ['name' => $name, 'value' => $request ]; 
			}
		else{
				$new_input['advanced']['CarouselConfig'][$key] = $options['advanced']['CarouselConfig'][$key];
		}
			
			$key++;
		}
		
		if($key == 0){
			$new_input['advanced']['CarouselConfig'] = $options['advanced']['CarouselConfig'];
		}
	
		 return $new_input;
    } 
	
    /** 
     * Print the Section text
     */
	public function printSecondaryTitle($args){
		$str = '';
		if($args['id'] == 'OC_Pages'){
			$str = 'Those pages need to be set so that Pepperi knows where to navigate users';
		}
		else if($args['id'] == 'OC_Configuration'){
			$str = 'Configure the product list to fit your needs';
		}
		else if($args['id'] == 'OC_Categories_Configuration'){
			$str = 'Configure the categories selection to fit your needs';
		}
		else if($args['id'] == 'OC_Carousel_Configuration'){
			$str = 'Configure the carousel behavior to fit your needs';
		}
		else if($args['id'] == 'OC_Advanced'){
			$str = 'Create API requests to be used by product carousel';
		}
		
		
		
		print $str;

	}
    public function print_section_info()
    {
		print '';
        //print 'Enter your settings below:';
    }

    /** 
     * Get the settings option array and print one of its values
     */
    public function pep_secret_key_callback()
    {
		$secKey = $this->options['general']['pep_secret_key'];
        printf(
           /* '<input type="text" id="pep_secret_key" name="pep_opencatalog_options[general][pep_secret_key]" value="%s" />',*/
            '<textarea id="pep_secret_key" name="pep_opencatalog_options[general][pep_secret_key]">'. $secKey .'</textarea>',
			isset( $this->options['general']['pep_secret_key'] ) ? esc_attr( $this->options['general']['pep_secret_key']) : ''
        );
    }
	
    public function items_per_page_callback()
    {
		$optHtml = '<select id="pep_item_per_page_key" name="pep_opencatalog_options[pages][pep_item_per_page_key]">';
		
		$selectNumber = ($this->options['pages']['pep_item_per_page_key']) != '' ? $this->options['pages']['pep_item_per_page_key'] : 20;
		for ($x = 1; $x <= 5; $x++) {
			
			$is_selected = ( (string)$selectNumber == ( $x * 10 ) ? 'selected="selected"' : '' );
        	$optHtml .='<option value="'. $x * 10 .'"
					'.$is_selected.'>'. $x * 10 .'</option>';
			}
		$optHtml .= '</select>';
		printf( $optHtml);
    }
	
	public function categories_behavior_callback(){
		$isChecked = ($this->options['pages']['pep_categories_behavior'] === 'all_categories');
		
		$html = '<div style="margin-top: 6px"><input type="radio"'. ($isChecked ? 'checked' : '') .' name="pep_opencatalog_options[pages][pep_categories_behavior]" value="all_categories"> All categories can be selected<br/><br/>
        		 <input type="radio"'. ($isChecked ? '' : 'checked') .' name="pep_opencatalog_options[pages][pep_categories_behavior]" value="buttom_level">Only buttom level of 				 categories can be selected</div>';
   
    printf($html);
	}
	
	public function carousel_behavior_callback(){
		$isChecked = ($this->options['pages']['pep_carousel_behavior'] == 'page');
		
		$html = '<div style="margin-top: 6px"><input type="radio"'. ($isChecked ? 'checked' : '') .' name="pep_opencatalog_options[pages][pep_carousel_behavior]" value="page">Scroll by page<br/><br/>
        		 <input type="radio"'. ($isChecked ? '' : 'checked') .' name="pep_opencatalog_options[pages][pep_carousel_behavior]" value="element">Scroll by element</div>';
   
    printf($html);
	}
	
	public function get_advanced_requests_table_TR($key,$value = null){
		
		$valueName = $value != null ? $value->name : '';
		$valueValue = $value != null ? $value->value : '';

		return '<tr id="row_'. $key .'" class="advancedTableRow disableRow">
					<td><input readonly="true" type="text" id="row_'.$key.'_name" name="pep_opencatalog_options[advanced][CarouselConfig]['.$key.'][name]" value="'.$valueName .'"></td>
					<td><textarea readonly="true" id="row_'.$key.'_request" name="pep_opencatalog_options[advanced][CarouselConfig]['.$key.'][request]">'.$valueValue.'</textarea></td>
					<td><i onclick="editRequestTableRow(this);" class="fas fa-pencil-alt"></i><i onclick="deleteRequestTableRow(this);" class="fas fa-trash-alt"></i></td>
		</tr>';
	}
	
	public function draw_advanced_requests_Table(){
		
		$arr = get_option( 'pep_opencatalog_options' )['advanced']['CarouselConfig'];
		
		$html = '';
		$newRowKey = -1;
		
		
		foreach( $arr as $key=>$value ){
			
			$decodedValue = $value;									
			
			$jsonString = rawurldecode($value->value);						
			
			$decodedValue->value = urldecode($jsonString);									
/*			
			echo '<script>';
		    echo 'console.log("'. ($decodedValue->value) .'")';
  			echo '</script>';
	*/					
			$newRowKey = $key;
			$html .= $this->get_advanced_requests_table_TR($key,$decodedValue); 
			
		}
		
		if($newRowKey == -1){ // THERE IS NO ROWS
			$html .= $this->get_advanced_requests_table_TR(0); 
		}
		return $html;
	}
	
	public function advanced_requests_callback(){
		$html ='
		<table id="advancedRequestTable">
			<thead>
				<th>Name</th><th >Request</th><th></th>
			</thead>
        <tbody>'. $this->draw_advanced_requests_Table() .'
		
        </tbody>
  </table>';
		printf($html);
	}
	
	public function getPages(){
		$args = array(
			'parent' => '-1' // (int) Page ID to return direct children of. Default -1, or no restriction.
        );

		return get_pages($args);

	}
	
	public function open_catalog_page_callback()
    {
		$this->getPagesDdlHTML('pep_opencatalog_page_url');		
    }
	
	public function top_items_page_callback()
    {
		$this->getPagesDdlHTML('pep_topitems_page_url');
    }
	
	public function pep_itemdetails_callback()
    {
		$this->getPagesDdlHTML('pep_itemdetails_page_url');
    }
	
	public function getPagesDdlHTML($key){
		$optHtml = '<select id="' .$key. '" name="pep_opencatalog_options[pages][' .$key. ']"><option value="-1">Selct page</option>';
		$pages = $this->getPages();
		$selectPage = $this->options['pages'][$key];
		foreach( $pages as $page ){
			$selectedPageURL = get_page_link( $page->ID );
			$is_selected = ( (string)$selectPage == $selectedPageURL ? 'selected="selected"' : '' );
        	$optHtml .='<option value="'.$selectedPageURL.'"
					'.$is_selected.'>'.$page->post_title.'</option>';
			}
		$optHtml .= '</select>';
		printf( $optHtml);
	}

}

if( is_admin() )
    $pepOpenCatalogSettings = new PepOpenCatalogSettings();