//Get our passwords
var v = 1.1;

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse)
	{
		var passes = JSON.parse(localStorage['passwords'] || '[]');
    
    console.log(request,sender,sendResponse);

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
					sendPass = Pass.init(id);

					if(request.password && request.password.length>0)
					{
						//We've been sent a password, so we should apply it (potentially).
						sendPass.password(request.password);
					}
					//Send back a generated password
					sendResponse(sendPass.generate(sender.tab.url,request.disabletld));
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
								localStorage['password_'+id+'_password']:false
						}
					});
					sendResponse({length: passes.length, passes: response})
				}
        //Add a catch for when there are no profiles but a password needs generating
        else if(passes.length==0 && request.message=='request')
        {
          sendPass = Pass.none;
          sendPass.password(request.password);
          sendResponse(sendPass.generate(sender.tab.url,request.disabletld));
        }
			}
			else if(request.message == 'versioncheck')
			{
				/* Version check! */
				if(!localStorage['version'] || localStorage['version']<v)
				{
					if(request.notify)
					{
						localStorage['version'] = v.toFixed(1);
					}
					else
					{
						//chrome.experimental.infobars.show({path: 'scp_info_updated.html'});
						sendResponse(
						{
							notify: true,
							message: 'SuperChromePass has been updated to the latest version ('+
							v.toFixed(1).toString()+'). Click the options button for more:'
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
