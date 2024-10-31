<?php 
class PepOpenCatalogHtml {  
    
    
    private static $html = null;

    public static function getHeaderHtml() {           
        
        self::$html = "<!--CSS Spinner-->
		<div class='spinner-wrapper'>
				<div class='spinner'></div>
		</div>
		<div class='pepHeader pep-open-catalog'>
                            <pep-web-button id='pep-filter-menu' icon-name='system_filter_2' class='pep-spacing-element fl' style='display:none;'></pep-web-button>
                            <div class='fl'>
                                <pep-web-menu icon-name='arrow_down' style-type='regular'></pep-web-menu>
                            </div>			
                            <div class='fr pep-search-cont'>		
                                <pep-web-search use-as-web-component=true></pep-web-search>
                            </div>								
                        </div>";
 
        return self::$html;
      
	}

   public static function getListHtml() {
    self::$html = "<div class='fr rightContainer  pep-open-catalog'>		
                <div class='pep-header-container pep-border-bottom'>
						<div id='one-line-totals' class='body-sm fl'><label>Showings</label>&nbsp;<label class='bold body-md total-num'>0</label>&nbsp;<label>results</label></div>
                        <table id='two-line-totals' class='body-xs ellipsis fl'>
                            <tr><td>Showings</td></tr>
                            <tr><td><span class='total-num title-md ellipsis'>0</span>&nbsp;results</td></tr>
                        </table>
                    <pep-list-views class='fr pep-spacing-element'></pep-list-views>
                    <pep-list-sorting class='fr pep-spacing-element'></pep-list-sorting>		  		  		  		  
            </div>
                <div class='pep-list-container'>
                    <pep-list use-as-web-component=true></pep-list>
                </div>					  		
            </div>";

    return self::$html;
	  
   }

   public static function getSmartSearchHtml() {

	   self::$html = "<div class='fl leftContainer pep-open-catalog'>					
						<pep-side-bar use-as-web-component=true class='fl'>
							<pep-smart-filters use-as-web-component = true>
							</pep-smart-filters>
						</pep-side-bar>
           		    </div>";

    return self::$html;
		   
   }
	
	public static function getPageTitle($title = null){
		self::$html = "<div class='title-md ellipsis fl'>" . $title . "</div>";
		 return self::$html;
	}

   public static function getCarouselHtml($name = '', $size='md') {
        self::$html = "<div class='pepCarousel  pep-open-catalog'>								
                        <pep-web-carousel data-carousel-size='" . $size . "' data-carousel-name='" . $name . "'></pep-web-carousel>			
                       </div>";

        return self::$html;

   }  
	
	public static function getPepperiFormlHtml() {
        self::$html = "<pep-web-form class='pep-open-catalog pep-item-details'></pep-web-form>";

        return self::$html;
   } 
	
	public static function getPepperiBreadCrumbsHtml($title = null, $homePage = '/') {				
		
				self::$html = "<div class='pep-header-container fl pep-open-catalog'>
									<div id='lbl-breadcrumbs' class='body-xs ellipsis fl'>
										<pep-bread-crumbs></pep-bread-crumbs>
									</div>
								</div>";

			
			return self::$html;
	}		

   public static function getPepperiSizeDetector(){
	   
	    self::$html = "<pep-size-detect use-as-web-component=true></pep-size-detect>";

        return self::$html;
   }
 	
}

?>