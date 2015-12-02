# Steamcommunity Mobile Confirmations
[![npm version](https://img.shields.io/npm/v/steamcommunity-mobile-confirmations.svg)](https://npmjs.com/package/steamcommunity-mobile-confirmations)
[![npm downloads](https://img.shields.io/npm/dm/steamcommunity-mobile-confirmations.svg)](https://npmjs.com/package/steamcommunity-mobile-confirmations)
[![license](https://img.shields.io/npm/l/steamcommunity-mobile-confirmations.svg)](https://github.com/GaletskyIvan/steamcommunity-mobile-confirmations/blob/master/LICENSE)

This lightweight module allows you to automate Steamcommunity mobile confirmations in Node.js.

Usage is simple:

```js
var SteamcommunityMobileConfirmations = require('steamcommunity-mobile-confirmations');
var steamcommunityMobileConfirmations = new SteamcommunityMobileConfirmations(
{
	steamid:         this.steam.steamID,
	identity_secret: this.identity_secret,
	device_id:       this.device_id,
	webCookie:       webCookie,
});
steamcommunityMobileConfirmations.FetchConfirmations((function (err, confirmations)
{
	if (err)
	{
		console.log(err);
		return;
	}
	console.log('steamcommunityMobileConfirmations.FetchConfirmations received ' + confirmations.length + ' confirmations');
	if ( ! confirmations.length)
	{
		return;
	}
	this.steamcommunityMobileConfirmations.AcceptConfirmation(confirmations[0], (function (err, result)
	{
		if (err)
		{
			console.log(err);
			return;
		}
		console.log('steamcommunityMobileConfirmations.AcceptConfirmation result: ' + result);
	}).bind(this));
}).bind(this));
```
