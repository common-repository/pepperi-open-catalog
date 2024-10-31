<?php
/**
 * Plugin Name: Pepperi Open Catalog 
 * Plugin URI: 
 * Description: Allows distributors and wholesalers using the Pepperi B2B eCommerce module to share their product catalog
 * Version: 2.1.0
 * Author: Pepperi
 * Author URI: https://www.pepperi.com
 * License: GPLv2 or later
 */
 
/*  Copyright YEAR  PLUGIN_AUTHOR_NAME  (email : PLUGIN AUTHOR EMAIL)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as 
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
// Start writing code after this line!

require('inc/settings.php');
require('inc/html.php');
require('ajax/Ajax.php');

class PepOpenCatalogMain {

	private $pluginSettings = null;
	
    public function  __construct(){
		$this->pluginSettings = get_option('pep_opencatalog_options');	
		add_filter( 'body_class', array($this,'pepOpenCatalog_bodyClass'));	
		add_action( 'wp_enqueue_scripts', array($this, 'pepOpenCatalog_styles'), 99999 );
		add_action( 'wp_enqueue_scripts',  array($this,'pepOpenCatalog_scripts'));		
		add_action( 'wp_head',  array($this,'pepperi_oc_sizedetector'));
		add_shortcode('pepperi_oc_top_bar', array($this,'pepperi_oc_top_bar'));
		add_shortcode('pepperi_oc_products_filter', array($this,'pepperi_oc_products_filter'));
		add_shortcode('pepperi_oc_products', array($this,'pepperi_oc_products'));		
		add_shortcode('pepperi_oc_products_carousel', array($this,'pepperi_oc_products_carousel'));		
		add_shortcode('pepperi_oc_product_details', array($this,'pepperi_oc_product_details'));
		add_shortcode('pepperi_oc_breadcrumbs', array($this,'pepperi_oc_breadcrumbs'));		
		
    }	
	
	public function pepOpenCatalog_bodyClass( $classes ) {
			if(!in_array('pepperi-theme', $classes)) {
			  $classes[] = 'pepperi-theme';
			}         
			return $classes;     
	}		    				
	
	 public function pepOpenCatalog_scripts(){		   	   			   			   		 		 
		 wp_enqueue_script( 'pepOpenCatalogComp_Id', plugin_dir_url( __FILE__ ) . 'scripts/webcomponent.js', array('jquery'), '1.0.4', false );	
		 wp_enqueue_script( 'pepOpenCatalogItemsDataAjax_Id', plugin_dir_url( __FILE__ ) .  'scripts/pepUtils.js', array('jquery'), '1.0.1', false );	
		 wp_enqueue_script( 'pepOpenCatalogMainComponents_Id', plugin_dir_url( __FILE__ ) .  'scripts/pepperiComponents.js', array('jquery'), '1.0.0', false );	
		 
		 wp_localize_script( 'pepOpenCatalogItemsDataAjax_Id', 'plugin_Settings', get_option('pep_opencatalog_options'));		 

		
		 if(is_page(url_to_postid($this->pluginSettings['pages']['pep_opencatalog_page_url']))){
			 wp_enqueue_script( 'pepOpenCatalogItemsData_Id', plugin_dir_url( __FILE__ ) .  'scripts/openCatalog_main.js', array('jquery'), '1.0.1', true );				
		 }

		 if(is_page(url_to_postid($this->pluginSettings['pages']['pep_topitems_page_url']))){
			 wp_enqueue_script( 'pepOpenCatalogTopItemsData_Id', plugin_dir_url( __FILE__ ) .  'scripts/topItems_main.js', array('jquery'), '1.0.0', true );							
		 }		 		 		 
		 
		 if(is_page(url_to_postid($this->pluginSettings['pages']['pep_itemdetails_page_url']))){
			 wp_enqueue_script( 'pepOpenCatalogItemDetailsData_Id', plugin_dir_url( __FILE__ ) .  'scripts/itemDetails_main.js', array('jquery'), '1.0.0', true );							
		 }
	}
    

	public function pepOpenCatalog_styles(){						
		    wp_enqueue_style( 'pepOpenCatalogCss_Id', plugin_dir_url( __FILE__ ) .  'styles/plugin.css', array(), '1.0.2',  'all' );
			wp_enqueue_style( 'pepOpenCatalogStyle_Id', plugin_dir_url( __FILE__ ) .  'styles/styles.css', array(), '1.0.0', 'all' );       
    }
	

	public function pepperi_oc_top_bar(){		
		return PepOpenCatalogHtml::getHeaderHtml();		   		
    }
			
	public function pepperi_oc_products_filter()
	{
		 if(is_page(url_to_postid($this->pluginSettings['pages']['pep_opencatalog_page_url']))){
			return PepOpenCatalogHtml::getSmartSearchHtml();	
		 }
	}
	
	public function pepperi_oc_products()
	{
		 if(is_page(url_to_postid($this->pluginSettings['pages']['pep_opencatalog_page_url']))){
			return PepOpenCatalogHtml::getListHtml();		
		 }
	}
	
	public function pepperi_oc_products_carousel($atts)
	{
		if(!wp_script_is('pepOpenCatalogCarousel_Id')){
				 wp_enqueue_script( 'pepOpenCatalogCarousel_Id', plugin_dir_url( __FILE__ ) .  'scripts/pep_oc_carousel_main.js', array('jquery'), '1.0.0', true );							
		}

		$atts = shortcode_atts(
        array(
            'name' => '', 
			'size' => ''
        ), $atts);
		
		$name = $atts['name'];
		$size = $atts['size'];
		
		if($name != '') {	
				return PepOpenCatalogHtml::getCarouselHtml($name, $size);	
		}		
		
	}

	public function pepperi_oc_breadcrumbs(){
		
		return PepOpenCatalogHtml::getPepperiBreadCrumbsHtml();
	}
	
	public function pepperi_oc_product_details()
	{	
		if(is_page(url_to_postid($this->pluginSettings['pages']['pep_itemdetails_page_url']))){			
			return PepOpenCatalogHtml::getPepperiFormlHtml();	 	
			
		}
	}	

	public function pepperi_oc_sizedetector(){
		echo PepOpenCatalogHtml::getPepperiSizeDetector();
	}
	
}

$pepOpenCatalogMain = new PepOpenCatalogMain();
?>