var Crypto  = require('crypto');
var Request = require('request');
var Cheerio = require('cheerio');


var SteamcommunityMobileConfirmations = function (options)
{
	this.steamid         = options.steamid;
	this.identity_secret = options.identity_secret;
	this.device_id       = options.device_id;

	this._j = Request.jar();
	this._request = Request.defaults({ jar: this._j });

	options.webCookie.forEach((function(name)
	{
		((function (cookie)
		{
			this._j.setCookie(Request.cookie(cookie), 'https://steamcommunity.com');
		}).bind(this))(name);
	}).bind(this));
};


SteamcommunityMobileConfirmations.prototype.FetchConfirmations = function (callback)
{
	this._request.get({
		uri: this._generateConfirmationURL(),
	}, (function(error, response, body)
	{
		if (error || response.statusCode != 200)
		{
			return callback(error || new Error(response.statusCode));
		}
		if (!body)
		{
			return callback(new Error('Invalid Response'));
		}
		var confirmations = [];
		var $ = Cheerio.load(body);
		$('[data-confid]').each((function (index, element)
		{
			var $confirmation = $(element);
			var descriptions = $confirmation.find('.mobileconf_list_entry_description>div').map(function ()
			{
				return $(this).text();
			});
			confirmations.push({
				id:           $confirmation.data('confid'),
				key:          $confirmation.data('key'),
				descriptions: descriptions,
				cancel:       $confirmation.data('cancel'),
				accept:       $confirmation.data('accept'),
			});
		}).bind(this));
		callback(null, confirmations);
	}).bind(this));
}

SteamcommunityMobileConfirmations.prototype.AcceptConfirmation = function (confirmation, callback)
{
	this._sendConfirmationAjax(confirmation, "allow", callback);
}

SteamcommunityMobileConfirmations.prototype.DenyConfirmation = function (confirmation, callback)
{
	this._sendConfirmationAjax(confirmation, "cancel", callback);
}

SteamcommunityMobileConfirmations.prototype._sendConfirmationAjax = function (confirmation, op, callback)
{
	var endpoint = 'https://steamcommunity.com/mobileconf/ajaxop?';
	var queryString = 'op=' + op + '&' +
	                  this._generateConfirmationQueryParams(op) +
	                  '&cid=' + confirmation.id + '&ck=' + confirmation.key;

	this._request.get({
		uri: endpoint + queryString,
	}, (function(error, response, body)
	{
		if (error || response.statusCode != 200)
		{
			return callback(error || new Error(response.statusCode));
		}
		if (!body)
		{
			return callback(new Error('Invalid Response'));
		}
		try
		{
			var result = JSON.parse(body);
			callback(null, result.success);
		}
		catch (e)
		{
			return callback(e);
		}
	}).bind(this));
}

SteamcommunityMobileConfirmations.prototype._generateConfirmationURL = function (tag)
{
	var endpoint = 'https://steamcommunity.com/mobileconf/conf?';
	var queryString = this._generateConfirmationQueryParams(tag ? tag : 'conf');
	return endpoint + queryString;
};

SteamcommunityMobileConfirmations.prototype._generateConfirmationQueryParams = function (tag)
{
	var time = Math.floor(Date.now() / 1000);
	return "p=" + this.device_id + "&a=" + this.steamid + "&k=" + this._generateConfirmationHashForTime(time, tag) + "&t=" + time + "&m=android&tag=" + tag;
};

SteamcommunityMobileConfirmations.prototype._generateConfirmationHashForTime = function (time, tag)
{
	var sourceLength = 8;

	if (tag != null)
	{
		if (tag.length > 32)
		{
			sourceLength = 8 + 32;
		}
		else
		{
			sourceLength = 8 + tag.length;
		}
	}

	var source = new Buffer(sourceLength);

	source.writeUInt32BE(0, 0); // This will stop working in 2038!
	source.writeUInt32BE(time, 4);

	if (tag != null)
	{
		(new Buffer(tag, 'utf8')).copy(source, 8, 0, sourceLength - 8);
	}

	try
	{
		var secret = new Buffer(this.identity_secret, 'base64');
		var hmacGenerator = Crypto.createHmac('sha1', secret);
		var hashedData = hmacGenerator.update(source).digest();
		var encodedData = hashedData.toString('base64');
		var hash = encodeURIComponent(encodedData);
		return hash;
	}
	catch (e)
	{
		return null; //Fix soon: catch-all is BAD!
	}

};


module.exports = SteamcommunityMobileConfirmations;
