
class Validation
{
	constructor(){}

	static encode(str)
	{
		return String(str).replace(/['"<>&\r\n\\]/gi, function (c) {
            var lookup = {'\\': '&#x5c;', '\r': '&#x0d;', '\n': '&#x0a;', '"': '&quot;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '&': '&amp;'};
            return lookup[c];
        });
	}

}

module.exports = Validation;