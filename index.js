const request = require('request');
const cheerio = require('cheerio');
const argv = require('minimist')(process.argv.slice(2), {});

const options = {
  url: 'https://kgsearch.googleapis.com/v1/entities:search?query=' +
    argv._[0] +
    '&key=AIzaSyAaBLhs1pKLTQyGD8CT0N4CSeqM2q-6G7s&limit=1&indent=True'
};

const psoptions = {
  url: 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?url=' +
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

request(options, function (error, response, html) {
  if (!error) {
    const $ = cheerio.load(html);
    console.log(html);
    if (JSON.parse(html).itemListElement[0] !== undefined) {
      if (
        JSON.parse(html).itemListElement[0].result.detailedDescription
        .articleBody !== undefined
      ) {
        console.log(
          '\n' +
          JSON.parse(html).itemListElement[0].result.detailedDescription
          .articleBody +
          '\n'
        );
      }
    }
  }
});

if (argv._[0].indexOf('http://') > -1 || argv._[0].indexOf('https://') > -1) {
  request(psoptions, function (error, response, html) {
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

request(wikioptions, function (error, response, html) {
  const $ = cheerio.load(html);
  console.log(
    $('.mw-parser-output p')
    .eq(0)
    .text()
  );
});

const pageSpeedAPI = (url) => {
  const PS_API = {
    url: `https://www.googleapis.com/pagespeedonline/v2/runPagespeed?url=${
        url
      }&key=AIzaSyAaBLhs1pKLTQyGD8CT0N4CSeqM2q-6G7s&strategy=mobile`
  };

  request(PS_API, async function (error, response, html) {
    if (error) {
      console.log(error);
    }
    if (!error) {
      const json = await JSON.parse(html);
      // console.log(json);

      const ps = `PAGE SPEED:
      \nTitle: ${json.title}
      \nURL: ${json.id}
      \nSpeed: ${json.ruleGroups.SPEED.score}
      \nUsability: ${json.ruleGroups.USABILITY.score}
      \n
      `

      console.log(ps);
    }
  });
}

const getMetadata = (url) => {
  request(url, async function (error, response, html) {
    if (error) {
      console.log(error);
    }

    if (!error) {
      const $ = cheerio.load(html);

      const meta =
        `METADATA:
          \n${url}
          \nTitle: ${$('meta[name="title"]').attr('content')}
          \nKeywords: ${$('meta[name="keywords"]').attr('content')}
          \nDescription: ${$('meta[name="description"]').attr('content')}
          \n`

      // {
      //   title: $('meta[name="title"]').attr('content'),
      //   keywords: $('meta[name="keywords"]').attr('content'),
      //   description: $('meta[name="description"]').attr('content')
      // }

      return meta;

      console.log(meta);
    }
  });
}

request(googleOptions, (error, response, html) => {
  const $ = cheerio.load(html);
  //   console.log($('#ires'));
  //   console.log($('#rso'));

  let results = [];

  $('.s cite').each(function (i, element) {
    if (
      $(this)
      .text()
      .indexOf('http://') > -1 ||
      $(this)
      .text()
      .indexOf('https://') > -1
    ) {
      results[i] = $(this).text();
    } else {
      results[i] = `http://${$(this).text()}`;
    }
  });

  results.join(' ');
  console.log('Google Search Rankings:\n', results);

  for (let result of results) {
    pageSpeedAPI(result);

    getMetadata(result);
  }

});