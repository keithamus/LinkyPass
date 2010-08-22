//Get our passwords
var v = 0.9;

/*
 * class Password
 *
 * Our base password function, to which all of our password types are extended.
 *
 */
var Password = {

	id: '',

	length: function() { return localStorage['password_'+this.id+'_length'] || 10; },

	salt: function()
	{
		return localStorage['password_'+this.id+'_salt']?
										localStorage['password_'+this.id+'_salt']:
										null;
	},

	generate: function(url,disabletld)
	{
		return SGPLocal(this.password(), url, disabletld, this.length(), this.salt());
	}

};

// Create our new extended functions
var Pass = {

	/*
	 * Pass.none
	 *
	 * Extend Password to give basic functionality,
	 */
	none: $.extend({},Password,
	{
		input: '',
		salt: function(){return null;},
		password: function(pass)
		{
			if(pass && pass.length>0)
			{
				this.input = pass;
			}
			return this.input;
		},
		generate: function(url,disabletld)
		{
			var spg = SGPLocal(this.input, url, disabletld, this.length(), this.salt());
			this.input = '';
			return spg;
		}
	}),

	/*
	 * Pass.hash
	 *
	 * Extend Password for hash types, hash doesn't store a password, only a hash to check
	 */
	hash: $.extend({},Password,
	{
		input: '',
		password: function(pass)
		{
			if(pass && pass.length>0)
			{
				this.input = pass;
			}
			return this.input;
		},
		generate: function(url,disabletld)
		{
			if(this.input.length>0)
			{
				return SGPLocal(this.input, url, disabletld, this.length(), this.salt());
			}
			else
			{
				return {pass: localStorage['password_'+id+'_password'], hash: true }
			}
		}
	}),

	/*
	 * Pass.session
	 *
	 * Extend password for sessnion. Session needs to store password in sessionStorage!
	 */
	session: $.extend({},Password,
	{
		password: function(pass)
		{
			if(pass && pass.length>0)
			{
				sessionStorage['password_'+this.id+'_password'] = pass;
			}
			return sessionStorage['password_'+this.id+'_password'];
		}
	}),

	/*
	 * Pass.always
	 *
	 * Extend password for always. Just return the password stored.
	 */
	always: $.extend({},Password,
	{
		password: function() { return localStorage['password_'+this.id+'_password']; }
	})

};

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse)
	{
		var passes = JSON.parse(localStorage['passwords'] || '[]');
		console.log(request);
		console.log(sender);

		//Our message has a tab id or extension id
		if(sender.tab || sender.id)
		{
				//The content script is just asking for options
			if(request.message == 'options')
			{
				sendResponse(JSON.parse(localStorage['options'] || '{}'));
			}
			//The content script is asking us what to do!
			else if (request.message == 'init' || request.message == 'request')
			{

				//No passwords in db, so send a quick message to tell the page.
				if(passes.length==0 && request.message=='init')
				{
					sendResponse({length: 0});
				}

				//We've only got one password, or we're only being asked for one...
				else if(passes.length==1 || (request.id && request.id.length>0))
				{
					id = parseInt(passes.length)==1?passes[0]:request.id;
					Pass[localStorage['password_'+id+'_type']].id = id;

					if(request.password && request.password.length>0)
					{
						//We've been sent a password, so we should apply it (potentially).
						Pass[localStorage['password_'+id+'_type']].password(request.password);
					}
					//Send back a generated password
					sendResponse(Pass[localStorage['password_'+id+'_type']].generate(sender.tab.url,request.disabletld));
				}
				//We've got lots of passwords, so present the user with a list of selections:
				else if(passes.length>1 && request.message=='init')
				{
					var response = {};
					passes.forEach(function(id)
					{
						response[id] =
						{
							id: id,
							name: localStorage['password_'+id+'_name'],
							hash: localStorage['password_'+id+'_type']=='hash'?
								localStorage['password_'+v+'_password']:false
						}
					});
					sendResponse({length: passes.length, passes: response})
				}
			}
			else if(request.message == 'versioncheck')
			{
				/* Version check! */
				if(!localStorage['version'] || localStorage['version']<v)
				{
					if(request.notify)
					{
						localStorage['version'] = v;
					}
					else
					{
						//chrome.experimental.infobars.show({path: 'scp_info_updated.html'});
						sendResponse(
						{
							notify: true,
							message: 'SuperChromePass has been updated to the latest version ('+v+'). '+
								'Click the options button for more:'
						});
					}
				}
			}
			else
			{
					console.warn('Snubbing due to bad message:');
					sendResponse({});
			}
		}
});
