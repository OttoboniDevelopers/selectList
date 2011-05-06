/*
*Kort dokumentation
*/
;
(function($) {
	var listItemHeight = 0,
	selectListHeight = 0,
	selectList,
	innerList,
	listItemsCount = -1,
	currentSelection = -1,
	lastChar = '',
	numPressed = 1,
	firstChar = [],
	doc = $(document),
	showScroll = false;
	/*
	* Private methods 
	*/

	_removeList = function(scope) {
		doc.unbind('keydown').unbind('click');
		$('.selectList').remove();
		scope.removeClass('focus above under');
	}
	_keydownIdentifier = function(e, scope, options) {
		if (!(e.keyCode == 9)) {
			e.preventDefault();	
			switch (e.keyCode) {
				case 38:
					// User pressed 'up' arrow
					_navigate('up', options);
					break;
				case 40:
					// User pressed 'down' arrow
					_navigate('down', options);
					break;
				case 13:
				case 32:
					// User pressed 'enter or space' and select an item
					_setSelectedItem(scope, options);
					break;
				default:
					_findCharAt(e, options);
					//Naviget in list with characters
			}
		} else {
			//user tabs to navigate
			_removeList(scope);
		}
	}


	_navigate = function(direction, options) {
		if (direction == 'up' && currentSelection > 0) {
			if (currentSelection) {
				currentSelection--;
			}
		} else if (direction == 'down') {
			if (currentSelection != listItemsCount) {
				currentSelection++;
			}
		}
		_setCurrentSelection(currentSelection, options);
	}
	_setCurrentSelection = function(currentSelection, options) {
		var selectedItem = selectList.find('.selected'); //CHANGE TO HOVER!!
		if(selectList.length){
			var pos = selectedItem.length ? selectedItem.position() : false;
			$('.item').removeClass('hover');
			$('#' + currentSelection).addClass('hover');
			if(options.autoScroll){
				var scroll = selectList.find('.scroll').last().outerHeight();
				if(pos.top > selectList.height() - scroll){
					var newTop = pos.top - innerList.outerHeight() + selectList.outerHeight() - selectedItem.outerHeight(),
						newTop = selectedItem.next().length ? (newTop + scroll) : newTop;
					innerList.css('top',newTop*-1);
					_updateScrollers();
				}
			}else{
				var scroll = selectList.scrollTop();
				if (pos.top >= selectListHeight - listItemHeight) {
					$('.selectList').scrollTop(pos.top - selectListHeight + selectedItem.outerHeight());
				} else if (pos.top < -1) {
					$('.selectList').scrollTop(scroll + pos.top + selectedItem.outerHeight());
				}
			}
		}
	}
	
	_updateScrollers = function(){
		var listPos = parseFloat(innerList.css('top')),
			selectedItem = selectList.find('.selected'),
			actionUp = listPos == 0 ? 'hide' : 'show',
			actionDown = selectedItem.next().length ? 'show' : 'hide';
		selectList.find('.scroll.up')[actionUp]();
		selectList.find('.scroll.down')[actionDown]();
	}

	_findCharAt = function(e, options) {
		if (firstChar.exists(String.fromCharCode(e.keyCode).toUpperCase())) {
			switch (e.keyCode) {
				case 221:
					var charPressed = 'Å';
					break;
				case 222:
					var charPressed = 'Ä';
					break;
				case 192:
					var charPressed = 'Ä';
					break;
				default:
					var charPressed = String.fromCharCode(e.keyCode).toUpperCase();
			}
			if (charPressed == lastChar) {
				numPressed++;
			} else {
				lastChar = charPressed;
				numPressed = 1;
			}
			var lastIndex = -1;
			for (var i = 0; i < numPressed; i++) {
				var index = -1;
				for (var j = lastIndex + 1; j < firstChar.length; j++) {
					if (firstChar[j] == lastChar) {
						index = j;
						break;
					}
				}
				if (index == -1) {
					if (i == 0) break;
					i = -1;
					lastIndex = -1;
					numPressed = 1;
				} else {
					currentSelection = index;
					_setCurrentSelection(index, options);
					lastIndex = index;
				}
			}
		}
	}

	_createListitem = function(item, counter, selectedIndex) {
		firstChar[listItemsCount] = item.text().replace(/^\s*|\s*$/g, '').charAt(0).toUpperCase();
		var isSelected = (counter == selectedIndex) ? ' selected' : '';
		return '<li id="' + listItemsCount + '" selectVal="' + item.val() + '" class="item'+isSelected+'">' + item.text() + '</li>';
	}

	Array.prototype.exists = function(search) {
		for (var i = 0; i < this.length; i++)
			if (this[i] == search) return true;

		return false;
	}

	_getScrollTop = function() {
		if (typeof pageYOffset != 'undefined') {
			//most browsers
			return pageYOffset;
		} else {
			var B = document.body;
			//IE 'quirks'
			var D = document.documentElement;
			//IE with doctype
			D = (D.clientHeight) ? D : B;
			return D.scrollTop;
		}
	}

	//Set the current selection in select and removes the list
	_setSelectedItem = function(scope, options) {
		scope.find(options.selectedText).html($('#' + currentSelection).html()).parent().find('select').val($('#' + currentSelection).attr('selectVal')).change();
		_removeList(scope);
	}

	_createSelectList = function(scope, options) { /*Get all listItems from select list*/
		var fixedWidth = options.fixedWidth,
			select = scope.find('select');
		listItems = '';
		listItemsCount = -1;
		currentSelection = select.attr('selectedIndex');
		scope.addClass('focus');
		select.children().each(function(i) {
			var self = $(this);
			if (self.is('optgroup')) {
				var listItemsChildren = '';
				self.children().each(
					function(j) {
						listItemsCount++;
						listItemsChildren += _createListitem(self, listItemsCount, currentSelection);
					});
				listItems += '<li class="optgroup">' + self.attr('label') + '<ul>' + listItemsChildren + '</ul></li>';
			} else {
				listItemsCount++;
				listItems += _createListitem(self, listItemsCount, currentSelection);
			}
		});
		if(options.autoScroll){
			selectList = $('<div class="selectList"><ul class="selectListInner">' + listItems + '</ul><div class="scroll up">UP</div><div class="scroll down">DOWN</div></div>');
		}else{
			selectList = $('<ul class="selectList">' + listItems + '</ul>');
		}
		
		// see  if selectlist is open
		if (!($('.selectList').length > 0)) {
		
			var windowHeight = $(window).height(),
				docHeight = doc.height(),
				scrollTop = _getScrollTop(),
				offset = scope.offset(),
				scopeHeight = scope.outerHeight();
		
			$('body').append(selectList);
			selectList.css({
				left: '-999999px',
				display: 'block',
				position: 'relative'
			});
			innerList = selectList.find('.selectListInner');
			
			
			// Sets height of list
			selectListHeight = 0;
			selectList.find('.item').each(function(){
				selectListHeight += $(this).outerHeight();
			});
			
			if(options.size != 'auto' && selectListHeight > options.size){
				showScroll = true;
				selectListHeight = options.size;
			}else{
				showScroll = false;
			}
			
			if (fixedWidth) {
				var width = scope.outerWidth();
				var minWidth = scope.outerWidth();
			} else {
				var width = 'auto';
				var minWidth = scope.outerWidth();
			}

			// see  if the list fitts in the bottom or top of the screen
			function _spaceUnder(reply){
				var calc = windowHeight - scopeHeight + (scrollTop - offset.top);
				return reply ? calc : calc >= selectListHeight ? true : false;
			}	
			function _spaceAbove(reply){
				var calc = offset.top - scrollTop - scopeHeight;
				return reply ? calc : calc >= selectListHeight ? true : false;
			}
			if (_spaceUnder()) {
				listPosition = {
					top: offset.top + scopeHeight,
					height: selectListHeight
				}
				scope.addClass('under');
				selectList.addClass('under');
			} else if (_spaceAbove()) {
				listPosition = {
					bottom: windowHeight + scrollTop - offset.top,
					height: selectListHeight
				}
				scope.addClass('above');
				selectList.addClass('above');
			} else {
				showScroll = true;
				var outer = selectList.outerHeight() - selectList.height();
				if((_spaceUnder(true) - _spaceAbove(true)) > 0){
					listPosition = {
						top: offset.top + scopeHeight,
						height: windowHeight - scopeHeight + (scrollTop - offset.top) - outer
					}
					scope.addClass('under');
					selectList.addClass('under');
				}else{
					listPosition = {
						bottom: docHeight - offset.top,
						height: offset.top - scrollTop  - outer
					}
					scope.addClass('above');
					selectList.addClass('above');
				}
			}
			
			listStyle = {
				position: 'absolute',
				width: width,
				left: offset.left,
				minWidth: minWidth
			};
			$.extend(listStyle, listPosition);
			
			// Navigation in list
			doc.bind('keydown', function(e) {
				_keydownIdentifier(e, scope, options)
			});

			if(options.autoScroll){
				var speed = options.scrollSpeed == 'slow' ? 5 : options.scrollSpeed == 'medium' ? 15 : options.scrollSpeed == 'fast' ? 25 : options.scrollSpeed,
					listTop = parseFloat(innerList.css('top')),
					scroll = selectList.find('.scroll'),
					pos = innerList.position();
				if(!showScroll){
					scroll.hide();
				}
				_updateScrollers();
				$.extend(listStyle, { overflow: 'hidden' });
				scroll.hover(function(){
					var self = $(this),
						listOuterHeight = selectList.outerHeight();
					t = window.setInterval(function(){
						// Do scrolling on interval
					    listTop = parseFloat(innerList.css('top'));
					    if(self.hasClass('down')){
					    	pos = innerList.position();
					    	if(pos.top < ((innerList.height()-listOuterHeight)*-1)){
					    		self.fadeOut(200);
					    	}else{
						    	if(listTop < 0){
						    		self.siblings().fadeIn(200);
						    	}
						    	var newtop = listTop-(speed/2);
						    	innerList.css('top',(newtop+'px'));
						    }
					    }else{
					    	if(listTop >= 0){
					    		self.fadeOut(200);
					    	}else{
					    		self.siblings().fadeIn(200);
					    		var newtop = listTop+(speed/2);
					    		innerList.css('top',(newtop+'px'));
					    	}
					    }
					},speed);
				},function(){
					clearInterval(t);
				});
			}
			
			selectList
				.removeAttr('style')
				.css(listStyle)
				.slideDown(options.animSpeed,function() {
					_setCurrentSelection(currentSelection, options);
				})
				.find('.item')
				.bind('click', function(e) {
					e.stopPropagation();
					currentSelection = $(this).attr('id')
					_setSelectedItem(scope, options);
				});
			
			// Close selectList
			doc.bind('click', function (e) {
				_removeList(scope);
				return false
			});
/*
			window.onblur = function(){
				_removeList(scope);
				return false
			}
*/

		}

	}

	$.fn.selectList = function(options) {
		var defaults = {
			size: 'auto', // int or 'auto'
			fixedWidth: true, // boolean
			animSpeed: 200, // int (ms)
			selectedText: 'span', // jQuery selector
			autoScroll: false, // boolean
			scrollSpeed: 'medium' // 'slow', 'medium', 'fast' or int (ms)
		};
		
		var options = $.extend({}, defaults, options);
        return this.each(function () {
            obj = $(this);
            select = obj.find('select');
            parent = $(this).parent();
            if (!window.Touch) {
                select.css({
                	position: 'absolute',
                	left: '-99999px'
                });
                obj[0].onselectstart = function() { return false; }
                obj.click(function (e) {
                    _removeList($(this));
                    e.stopPropagation();
                    _createSelectList($(this), options);
                });
                select.focus(function () {
                    _removeList($(this).parent());
                    _createSelectList($(this).parent(), options);
                });
            } else {
                select.focus(function () {
                    parent.addClass('focus');
                });
                select.blur(function () {
                    parent.removeClass('focus');
                });
                select.change(function () {
                    parent.find('.selectorText').html(this.options[this.selectedIndex].text);
                });

            }
		});
	}
})(jQuery);