( function( $ ) {
	'use strict';

(function(document, history, location) {

	var HISTORY_SUPPORT = !!(history && history.pushState);
  
	var anchorScrolls = {
	  ANCHOR_REGEX: /^#[^ ]+$/,
	  OFFSET_HEIGHT_PX: 70,
  
	  /**
	   * Establish events, and fix initial scroll position if a hash is provided.
	   */
	  init: function() {
		this.scrollToCurrent();
		window.addEventListener('hashchange', this.scrollToCurrent.bind(this));
		document.body.addEventListener('click', this.delegateAnchors.bind(this));
	  },
  
	  /**
	   * Return the offset amount to deduct from the normal scroll position.
	   * Modify as appropriate to allow for dynamic calculations
	   */
	  getFixedOffset: function() {
		return this.OFFSET_HEIGHT_PX;
	  },
  
	  /**
	   * If the provided href is an anchor which resolves to an element on the
	   * page, scroll to it.
	   * @param  {String} href
	   * @return {Boolean} - Was the href an anchor.
	   */
	  scrollIfAnchor: function(href, pushToHistory) {
		var match, rect, anchorOffset;
  
		if(!this.ANCHOR_REGEX.test(href)) {
		  return false;
		}
  
		match = document.getElementById(href.slice(1));
  
		if(match) {
		  rect = match.getBoundingClientRect();
		  anchorOffset = window.pageYOffset + rect.top - this.getFixedOffset();
		  window.scrollTo(window.pageXOffset, anchorOffset);
  
		  // Add the state to history as-per normal anchor links
		  if(HISTORY_SUPPORT && pushToHistory) {
			history.pushState({}, document.title, location.pathname + href);
		  }
		}
  
		return !!match;
	  },
  
	  /**
	   * Attempt to scroll to the current location's hash.
	   */
	  scrollToCurrent: function() {
		this.scrollIfAnchor(window.location.hash);
	  },
  
	  /**
	   * If the click event's target was an anchor, fix the scroll position.
	   */
	  delegateAnchors: function(e) {
		var elem = e.target;
  
		if(
		  elem.nodeName === 'A' &&
		  this.scrollIfAnchor(elem.getAttribute('href'), true)
		) {
		  e.preventDefault();
		}
	  }
	};
  
	window.addEventListener(
	  'DOMContentLoaded', anchorScrolls.init.bind(anchorScrolls)
	);
  })(window.document, window.history, window.location);

  	// get UR parameters
	$.urlParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);

		if ( results && results[ 1 ] )
			return results[ 1 ];
		else	
			return 0;
	};

	// Reduce
	$.fn.reduce = function( fnReduce, initialValue ) {
		var values = this,
				previousValue = initialValue;

		values.each( function( index, currentValue ) {
			previousValue = fnReduce.call(
				currentValue,

				previousValue,
				currentValue,
				index,
				values
			);
		} );

		return previousValue;
	};

	// Title sections
	$( ':header[id]' ).each( function() {
		var $self = $( this );

		$self.html(
			'<a href="#' + $self.attr( 'id' ) + '" class="title-anchor-link">#</a> ' + $self.html()
		);
	} );

	var getHeadingLevel = function( $el ) {
		var tagName = $el.prop( 'tagName' ).toLowerCase();

		if (
			! tagName ||
			[ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ].indexOf( tagName ) === -1
		) {
			return false;
		}

		return parseInt( tagName.replace( 'h', '' ), 10 );
	};

	var headings = $( ':header[id]' ).reduce( function( previousValue, currentValue ) {
		var currentHeading = {
			childrens: [],
		};

		currentHeading.$el = $( currentValue );
		currentHeading.level = getHeadingLevel( currentHeading.$el );

		if ( ! currentHeading.$el.length || currentHeading.level === false ) {
			return previousValue;
		}

		previousValue.push( currentHeading );

		return previousValue;
	}, [] );

	var majik = function( previousValue, currentHeading ) {
		if ( ! currentHeading.$el.length || currentHeading.level === false ) {
			return previousValue;
		}

		if ( previousValue.length < 1 ) {
			return [ currentHeading ];
		}

		var previousHeadingLevel = previousValue[ previousValue.length - 1 ].level;

		if ( currentHeading.level > previousHeadingLevel ) {
			previousValue[ previousValue.length - 1 ].childrens.push( currentHeading );
		} else {
			previousValue.push( currentHeading );
		}

		return previousValue;
	};

	var reduceLevels = function( list ) {
		list = list.reduce( majik, [] );

		var i;
		for ( i = 0; i < list.length; i += 1 ) {
			if ( ! list[ i ].childrens || ! list[ i ].childrens.length ) {
				continue;
			}

			list[ i ].childrens = reduceLevels( list[ i ].childrens );
		}

		return list;
	};

	var generateList = function( list, isFirstLevel ) {
		var $ul = $( '<ul></ul>' );
		$ul.addClass( 'level-' + list[ 0 ].level );
		if (list[ 0 ].level > 2) {
			$ul.addClass( 'hidden-xs' );
		}

		if ( true === isFirstLevel ) {
			$ul.addClass( 'nav first-level' );
		}

		var i, $li;
		var aClass='';

		for ( i = 0; i < list.length; i += 1 ) {
			$li = $( '<li></li>' );

			if (true === isFirstLevel && i == 0 ) {
				aClass='section-head orange-section-head';
			}

			$li.append(
				'<a class="js-smooth-scroll ' + aClass +'" href="#' + list[ i ].$el.attr( 'id' ) + '">' +
					list[ i ].$el.text().replace( /^#\ /, '' ) +
				'</a>'
			);

			if ( list[ i ].childrens && list[ i ].childrens.length ) {
				$li.append( generateList( list[ i ].childrens ) );
				$li.addClass( 'has-submenu' );
				if ( isFirstLevel ) {
					$li.addClass( 'first-submenu' );
				}
			}

			$ul.append( $li );
		}
		return $ul;
	};

	if ( headings.length ) {
		headings = reduceLevels( headings );

		generateList( headings, true ).appendTo( '.js-sections' );
	}

	// Smooth anchor scrolling
	var $jsSmoothScroll = $( '.js-smooth-scroll' );

	$jsSmoothScroll.click( function() {
		$( 'html, body' ).animate( {
			scrollTop: $( $( this ).attr( 'href' ) ).offset().top - 85
		}, 500 );

		return false;
	} );

	var handleSectionsListSize = function() {
		$( '.sections-list' ).css( 'width', $( '.sections-list-wrapper' ).width() );
	};

	handleSectionsListSize();
	$( window ).on( 'resize', handleSectionsListSize );

	// Affix init
	$( window ).on( 'load', function() {
		$( '.js-affix' ).affix( {
			offset: {
				top: function() {
					return (
						this.top = $( '.hero-subheader' ).outerHeight( true ) + 100
					);
				},
				bottom: function() {
					return (
						this.bottom = $( '.js-footer-area' ).outerHeight( true ) + 80
					);
				}
			}
		} );
	} );

	// Offcanvas
	$( '.offcanvas-toggle' ).on( 'click', function() {
		$( 'body' ).toggleClass( 'offcanvas-expanded' );
	});

	// Create next action for installation page
	if ( $(location).attr('href').search ('install_n_config') > 1) {
		var ref_url =  $.urlParam( 'ref_url' );
		var ref_content =  unescape($.urlParam( 'ref_content' ));
		var ref_content_section =  $.urlParam( 'ref_content_section' );
		 
		if (ref_url && ref_content) {
			$('.installation_default_next_step').hide();
			$('.installation_custom_next_step').html ("Continue following the <a href='" + ref_url + "#" + ref_content_section +"'>" + ref_content + "</a> from where you left off.");
		} else {
			$('.installation_custom_next_step').hide();
		}
	}

	// Handle click on tabs
	$('ul.tabs li').click(function(event, stopPropogation){
		var parent_tab_class='.' + $(this).parent().parent().attr('data-group');
		var tab_id = $(this).attr('data-tab');

		$(parent_tab_class + ' ul.tabs li').removeClass('current');
		$(parent_tab_class +' .tab-content').removeClass('current');

		$(this).addClass('current');
		$(parent_tab_class + " #"+tab_id).addClass('current');

		// Prevent circular trigger actions
		if (stopPropogation == true)
			return;

		// Find other tab classes in page and trigger click respectively
		// Without propogating
		// $('li.tab-link.' + tab_id).not ('.current').trigger('click',[true]);

	});

	// Open tabs when the page is launched with the query params 
	if ( $.urlParam( 'platform' )) {
		var platform = $.urlParam('platform');
		if (platform) {
			$('li.tab-link.'+ platform ).trigger('click');
		}
	}

	//Handle click for notification bar
	$( 	'div.row.notification-bar a' )
		.click( function( event ) {
			Cookies.set('notificationMessage_LastReceived', new String( new Date() ) );
			Cookies.set('notificationStatus', 'none');
			$( 'div.row.notification-bar' ).hide();

			if ( this.className == 'link-button' ) {
				// go to link
			} else {
				return false;
			}
		}
	);

	var showNotificationBar = function ( messageDate ) {

		var lastMessageReceived;
		
		if (Cookies.get('notificationMessage_LastReceived')) {
			lastMessageReceived = new Date( Cookies.get('notificationMessage_LastReceived'));
		} else {
			lastMessageReceived = new Date('January 1, 2017 12:00:00') ;
		} 
		
		// new message reveived
		if ( messageDate.getTime() > lastMessageReceived.getTime() ){
			$( 'div.row.notification-bar' ).show();
			Cookies.set('notificationStatus', 'received');
		} else {
			// do nothing
		}

	}

	// When the last message is received. Typicaly the announcement time
	showNotificationBar( new Date('August 1, 2018 11:42:00') );

	// Hide magnifying glass in search bar

	var hideSearchIcon = function() {
		let search_box = document.getElementById("search-input")
		search_box.onclick = function() {
			document.getElementById("search-image").style.display = "none";
			search_box.style.outline = "none";
			search_box.placeholder = "Search";
			search_box.style.paddingLeft = "2px";
		}
	}

	hideSearchIcon();

	// temporary for editing notif bar
	//document.getElementById("notification-bar").style.display = "block";

	var addLineNumbers = function() {
		var pre = document.getElementsByTagName('pre'), pl = pre.length;
		for (var i = 0; i < pl; i++) {
			var parent  = pre[i].parentNode.parentNode;
			if (parent.classList.contains("language-js")) {
				pre[i].innerHTML = '<span class="line-number"></span>' + pre[i].innerHTML + '<span class="cl"></span>';
				var num = pre[i].innerHTML.split(/\n/).length;
				for (var j = 0; j < (num - 1); j++) {
					var line_num = pre[i].getElementsByTagName('span')[0];
					line_num.innerHTML += '<span>' + (j + 1) + '</span>';
				}
			}
		}
	};

	addLineNumbers();

	var expandSearchBar = function() {
		const search_box = document.getElementById("search-input-xs");
		search_box.classList.add('search-box-expanded');
		const collapse_search = document.getElementById("collapse-search");
		collapse_search.style.display = "inline-block";
		const logo_container = document.getElementById("logo-container");
		logo_container.style.visibility = "hidden";
		document.getElementsByClassName("offcanvas-toggle")[0].style.visibility = "hidden";
	}

	var collapseSearchBar = function() {
		const search_box = document.getElementById("search-input-xs");
		search_box.classList.remove('search-box-expanded');
		const collapse_search = document.getElementById("collapse-search");
		collapse_search.style.display = "none";
		const logo_container = document.getElementById("logo-container");
		logo_container.style.visibility = "visible";
		search_box.value = "";
		document.getElementsByClassName("offcanvas-toggle")[0].style.visibility = "visible";
	}

	var moveOffCanvasToggle = function() {
		const container = document.getElementById("toggle-button-container");
		container.classList.toggle('toggle-button-container-expanded');
	}

	let search_box = document.getElementById("search-input-xs");
	let collapse_search = document.getElementById("collapse-search");
	let offcanvas_toggle = document.getElementsByClassName("offcanvas-toggle")[0];

	if (search_box) search_box.addEventListener("click", expandSearchBar);
	if (collapse_search) collapse_search.addEventListener("click", collapseSearchBar);
	if (offcanvas_toggle) offcanvas_toggle.addEventListener("click", moveOffCanvasToggle);
	$('meta[name=viewport]').attr('content', 'width=device-width,initial-scale=1,maximum-scale=1');

	let apiLink = function() {
		let api_select = document.getElementById('api-select');
		if (api_select.value != "default") {
			window.open(api_select.value, '_blank');
			api_select.value = "default";
		}
	}
	let api_select = document.getElementById('api-select');
	if (api_select) api_select.addEventListener("change", apiLink);

	let docsLink = function() {
		let docs_select = document.getElementById('docs-select');
		if (docs_select.value != "default") {
			if (docs_select.value.includes("aws-mobile")) {
				window.open(docs_select.value, '_blank');
				docs_select.value = "default";
			}
			else {
				window.open(docs_select.value, '_self');
			}
		}
	}
	let docs_select = document.getElementById('docs-select');
	if (docs_select) docs_select.addEventListener("change", docsLink);

}( jQuery ) );

	/**
	* Function that tracks a click on an outbound link in Analytics.
	* This function takes a valid URL string as an argument, and uses that URL string
	* as the event label. Setting the transport method to 'beacon' lets the hit be sent
	* using 'navigator.sendBeacon' in browser that support it.
	*/
	var trackOutboundLink = function(url) {
		gtag('event', 'click', {
		'event_category': 'outbound',
		'event_label': url,
		'transport_type': 'beacon',
		'event_callback': function(){document.location = url;}
		});

		return false;
	}