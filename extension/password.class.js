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