const request = require('request');
const cheerio = require('cheerio');
const argv = require('minimist')(process.argv.slice(2), {});

var options = {url: 'https://kgsearch.googleapis.com/v1/entities:search?query=' + argv.s + '&key=AIzaSyAaBLhs1pKLTQyGD8CT0N4CSeqM2q-6G7s&limit=1&indent=True'};
if(argv.t){options.url+='&types='+argv.t};
request(options, function(error, response, html) {
	if(!error) {
		var $ = cheerio.load(html);
		console.log(html);
		//console.log('\n'+JSON.parse(html).itemListElement[0].result.detailedDescription.articleBody+'\n');
	}
});