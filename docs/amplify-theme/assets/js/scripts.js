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

		if ( true === isFirstLevel ) {
			$ul.addClass( 'nav first-level' );
		}

		var i, $li;
		var aClass='';

		for ( i = 0; i < list.length; i += 1 ) {
			$li = $( '<li></li>' );

			if (true === isFirstLevel && i == 0 ) {
				aClass='section-head';
			}

			$li.append(
				'<a class="js-smooth-scroll ' + aClass +'" href="#' + list[ i ].$el.attr( 'id' ) + '">' +
					list[ i ].$el.text().replace( /^#\ /, '' ) +
				'</a>'
			);

			if ( list[ i ].childrens && list[ i ].childrens.length ) {
				$li.append( generateList( list[ i ].childrens ) );
				$li.addClass( 'has-submenu' );
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
	} );

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
		$('li.tab-link.' + tab_id).not ('.current').trigger('click',[true]);

	});

	$.urlParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		return results[1] || 0;
	}

	// Open tabs when the page is launched with the query params 
	if ($.urlParam('platform')) {
		var platform = $.urlParam('platform');
		if (platform) {
			$('li.tab-link.'+ platform ).trigger('click');
		}
	}


}( jQuery ) );

