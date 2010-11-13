$(document).ready(function(){

	//Define options defaults.
	var options = { key_key: 'P' };

	//Go get real options
	chrome.extension.sendRequest({message: 'options'}, function(response)
	{
		$.extend(options,response);
		if(options && !options.notonload)
		{
			$('input[type="password"]:not(:hidden)').each(function(){makeSCP.call(this);});
		}
	});

	makeSCP = (function(){

		var passH = $(this).outerHeight(),
		    passW = $(this).outerWidth(),
						passT = $(this).offset().top,
						passL = $(this).offset().left,
						id    = 'scp-';

		if(!$(this).attr('id'))
		{
			for(i=0;i<5;++i)
			{
				id+= Math.floor(Math.random()*11);
			}
			$(this).attr('id',id);
		}
		else
		{
			id = $(this).attr('id');
		}

		$(this).keyup(function(e)
		{
				if(e.shiftKey && !e.altKey && e.ctrlKey && e.keyCode == options.key_key.charCodeAt(0))
				{
					$('#scp-button-'+$(this).attr('id')).click();
				}

				if(e.keyCode == 13 && $('#scp-button-'+this.id).hasClass('expanded') &&
						$('#scp-button-'+this.id).find('.active').length>0)
				{
					$('#scp-button-'+this.id).find('.active').click();
				}

				el = $('#scp-button-'+this.id);
				if(el.hasClass('expanded') && el.find('li').length>0)
				{
						if(e.keyCode == 40)
						{
							li = el.find('li.active').next().length>0?
								el.find('li.active').next():el.find('li').first();
							el.find('li').removeClass('active').filter(li).addClass('active');
						}
						else if(e.keyCode == 38)
						{
							li = el.find('li.active').prev().length>0?
								el.find('li.active').prev():el.find('li').last();
							el.find('li').removeClass('active').filter(li).addClass('active');
						}
				}
		});

		$('body').append(

			$('<div/>',
			{
				class:        'superchromepass_button',
				height:       passH-2,
				width:        passH-1,
				id:           'scp-button-'+id
			}).css({
				top:          passT,
				left:         passL+passW,
				borderRadius: '0 8px 8px 0',
				lineHeight:   passH - (passH/6)+'px'
			}).data('input',this).click(function(e){

				var self = this;
				var tld = e.shiftKey;

				if(!$(this).hasClass('expanded'))
				{
					//Ask our background page what to do:
					chrome.extension.sendRequest({message: 'init'}, function(response)
					{
						input = $($(self).data('input'));

						//Our background page says we have multiple passes stored in the DB,
						// we should show the names of those:
						if(response.length>1)
						{
							//Stretch our tab our and show the password options
							scpopen(self).html('<ul/>',{id: 'multiple'});
							$.each(response.passes,function(id, o){
								$('ul',self).append(
									$('<li/>',
									{
										id: id,
										text: o.name
									}).click(function(){
										var id = this.id;
										$(this).parents('ul').slideUp(250);
										chrome.extension.sendRequest(
										{
											message: 'request',
											id: id,
											disabletld: tld
										}, function(response){scponepass(response,self,tld,id)});
									})
								);
							});
						}

						//We've only got one password, and its stored in our background page, so lets
						// just put that in our password field!
						else if(response.password)
						{
							scpclose(self);
							$('#'+$(self).attr('id').substr(11)).val(response.password);
						}

						//We don't have a password sent back to us, which means we need to ask for one:
						else
						{
								scponepass(response,self,tld);
						}
					});
				}

			}).append($('<b/>').text('p'))

	);

	});

	$('input[type="password"]:not(:hidden)').live('focus',function(){
		if(!this.id || $('#scp-button-'+this.id).length==0)
		{
			!$(this).hasClass('scp-pass') && makeSCP.call(this);
		}
	});

	scpclose = function(id){
		$(id).animate(
		{
			width:        15,
			height:       15,
			marginTop:    0,
			marginLeft:   '-17px',
			fontSize:     9,
			lineHeight:   '10px',
			borderRadius: '0 0 0 5px'
		},150).addClass('corner').removeClass('expanded').
			children('input,p').hide(200,function(){$(this).remove()});
		if($(id).children('b').length==0)
		{
			$(id).append( $('<b/>').text('p') );
		}
		$($(id).data('input')).focus();
		return $(id);
	}

	scpopen = function(id){
		$(id).animate({
				width:        150,
				borderRadius: '0 0 8px 8px',
				marginTop:    $($(id).data('input')).outerHeight(),
				marginLeft:   $(id).hasClass('corner')?'-=135':'-=152'
		},100).addClass('expanded').children('b').remove();
		return $(id);
	}

	scponepass = function(response,self,tld,id)
	{
		//We got a response, is it our password?
		if(response.pass && response.pass.length>1 && !response.hash)
		{
			input.val(response.pass);
			scpclose(self);
		}
		//Its not, so we need to present a password box for the user:
		else
		{
			if(!$(self).hasClass('expanded')) { scpopen(self); }
			scpinput(response,self,tld,id);
		}
	}

	scpinput = function(response,self,tld,id)
	{
		$(self).append(
				$('<input/>',{type: 'password',id: id,class: 'scp-pass'}).keyup(function(e)
				{
					if(response.hash)
					{
						if(b64_md5($(this).val()) == response.pass)
						{
							$(this).addClass('good').removeClass('bad');
						}
						else
						{
							$(this).addClass('bad').removeClass('good');
						}
					}
					if(e.keyCode==13)
					{
						chrome.extension.sendRequest(
						{
							id: $(this).attr('id'),
							message: 'request',
							password: $(this).val(),
							disabletld: tld
						}, function(response)
						{
							//We got a response, is it our password?
							if(response.pass && response.pass.length>1 && !response.hash)
							{
								input.val(response.pass);
								scpclose(self);
							}
						});
						return false;
					}
          e.stopImmediatePropagation();
          return true;
				}).
        //Stop the password box from returning any events to potentially malicious scripts!
        bind('blur, focus, focusin, focusout, load, resize, scroll, unload, click, dblclick, mousedown, mouseup, mousemove, mouseover, mouseout, mouseenter, mouseleave, change, select, submit, keydown, keypress, keyup, error',
        function(e){
          alert('This website has attempted to steal the contents of the SCP password box!');
          e.stopImmediatePropagation();return true}),
				$('<p/>',{text: 'Enter Password'})
			);
		$(self).children('input').focus();
	}

	$(window).resize(function(){
		$('input[type="password"]:not(:hidden)').each(function(){

			$('#scp-button-'+$(this).attr('id')).css({
				top:  $(this).offset().top,
				left: $(this).offset().left+ $(this).outerWidth()
			})

		});
	});

});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		if (request.type == 'get')
		{
			response = $('input[type="password"][value!=""]:not(:hidden)').val();
			sendResponse({value:response});
		}
		else if (request.type == 'set')
		{
			$('input[type="password"]:not(:hidden)').val(request.value);
			//TODO: Animate buttons inside.
			sendResponse({});
		}
});


/* This code soon wont be needed when chrome.experimental.infobar comes into main.*/
function UpdateNotify(t,s,bt,bu)
{
		s = s || 'data:image/png;base64,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%3D';
		$('body').append(
				$('<div/>',{id: 'update_bar',width: $(window).width()-10}).
						text(t).
						append(
								$('<img/>',{src: s,width: 26,height: 26}),
								$('<a/>',{class: 'close'}).click(function()
								{
										$(this).parents('div').animate({top: '-36px'},500,function(){$(this).remove();});
										$('body').animate({marginTop: '-=36px'});
								}),
								$('<div/>',{class: 'button'}).append(
										$('<button/>').text(bt || 'Options').click(function()
										{
											window.open(chrome.extension.getURL(bu || 'options.html'));
										})
								)
				)
		).animate({marginTop: '+=36px'},200);
		$('#update_bar').animate({top: '0'},200);
		return true;
}
chrome.extension.sendRequest({message: 'versioncheck'}, function(response)
{
		if(response.notify)
		{
				UpdateNotify(response.message,false,'Options','scp_options.html');
				chrome.extension.sendRequest({message: 'versioncheck', notify: true});
		}
});