const request = require('request');
const cheerio = require('cheerio');
const argv = require('minimist')(process.argv.slice(2), {});

const options = {
  url:
    'https://kgsearch.googleapis.com/v1/entities:search?query=' +
    argv._[0] +
    '&key=AIzaSyAaBLhs1pKLTQyGD8CT0N4CSeqM2q-6G7s&limit=1&indent=True'
};

const psoptions = {
  url:
    'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?url=' +
    argv._[0] +
    '&strategy=mobile&key=AIzaSyAaBLhs1pKLTQyGD8CT0N4CSeqM2q-6G7s'
};

const googleOptions = {
  url: `https://www.google.com/search?q=${argv._[0]}`
};

const wikioptions = {
  url: `https://en.wikipedia.org/wiki/${argv._[0]}`
};

if (argv.t) {
  options.url += '&types=' + argv.t;
}

request(options, function(error, response, html) {
  if (!error) {
    const $ = cheerio.load(html);
    console.log(html);
    if (JSON.parse(html).itemListElement[0] !== undefined) {
      if (JSON.parse(html).itemListElement[0].result.url !== undefined) {
        console.log(
          '\n' + JSON.parse(html).itemListElement[0].result.url + '\n'
        );
      }
    }
  }
});

if (argv._[0].indexOf('http://') > -1 || argv._[0].indexOf('https://') > -1) {
  request(psoptions, function(error, response, html) {
    if (!error) {
      //console.log(html);
      const json = JSON.parse(html);
      console.log(
        '\nSpeed: ' +
          json.ruleGroups.SPEED.score +
          '/100\nUsability:' +
          json.ruleGroups.USABILITY.score +
          '/100\n'
      );
    }
  });
}

request(wikioptions, function(error, response, html) {
  const $ = cheerio.load(html);
  console.log(
    $('.mw-parser-output p')
      .eq(0)
      .text()
  );
});

request(googleOptions, (error, response, html) => {
  const $ = cheerio.load(html);
  //   console.log($('#ires'));
  //   console.log($('#rso'));

  let results = [];

  $('cite').each(function(i, element) {
    if (
      $(this)
        .text()
        .indexOf('http://') > -1 ||
      $(this)
        .text()
        .indexOf('https://') > -1
    ) {
      results[i] = $(this).text();
    } else if (
      $(this)
        .text()
        .indexOf('www') > -1
    ) {
      results[i] = `https://${$(this).text()}`;
    } else {
      results[i] = `https://${$(this)
        .text()
        .replace(/\s+/g, '')
        .toLocaleLowerCase()}.com/`;
    }
  });

  results.join(' ');
  console.log('Google Search Results:\n', results);

  for (let result of results) {
    const PS_API = {
      url: `https://www.googleapis.com/pagespeedonline/v2/runPagespeed?url=${
        result
      }&key=AIzaSyAaBLhs1pKLTQyGD8CT0N4CSeqM2q-6G7s1`
    };

    setInterval(() => {
      request(PS_API, function(error, response, html) {
        if (!error) {
          // console.log(html);
          const json = JSON.parse(html);
          console.log(
            `${result}:\nSpeed: ${
              json.ruleGroups.SPEED.score
            }/100\nUsability: ${json.ruleGroups.USABILITY.score}/100\n`
          );
        }
      });
    }, 3000);
  }
});
