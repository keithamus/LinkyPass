function AddPassToPage(pass)
{
  var forms,i,form,n;
  forms = document.forms;
  for(n=0; n<forms.length; ++n)
		{
    form = forms[n];
    for (i=0; i<form.length; ++i)
				{
      if (form[i].type.toLowerCase() == 'password')
						{
							form[i].style.backgroundImage = "url('data:image/gif;base64,R0lGODlhDQAOAJEAAAjOCPn%2B%2Bd343f%2F%2F%2FyH5BAEAAAMALAAAAAANAA4AAAIlhI83CRKhFoKAjouE0eBi81CdJ3ERWSWkx6ws4r5GLNOvzeJeAQA7')";
       form[i].value = pass;
       form[i].style.backgroundPosition='top right';
       form[i].style.backgroundRepeat='no-repeat';
      }
    }
  }
}

function GetPassFromPage()
{
	 var forms,i,form,n;
  forms = document.forms;
  for(n=0; n<forms.length; ++n)
		{
    form = forms[n];
    for (i=0; i<form.length; ++i)
				{
      if (form[i].type.toLowerCase() == 'password' && form[i].value.length > 1)
						{
							return form[i].value;
      }
    }
  }
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		if (request.type == 'get')
		{
			response = GetPassFromPage();
			sendResponse({value:response});
		}
		else if (request.type == 'set')
		{
			AddPassToPage(request.value);
			sendResponse({});
		}
		else if (request.type == 'log')
		{
			console.log(request.value);
			sendResponse({});
		}
});