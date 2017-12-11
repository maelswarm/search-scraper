const request = require('request');
const cheerio = require('cheerio');
const argv = require('minimist')(process.argv.slice(2), {});

const getKnowledgeGraph = (query) => {
  const graphSearch = {
    url: `https://kgsearch.googleapis.com/v1/entities:search?query=${query}&key=AIzaSyAaBLhs1pKLTQyGD8CT0N4CSeqM2q-6G7s&limit=1&indent=True`
  };

  if (argv.t) {
    graphSearch.url += '&types=' + argv.t;
  }

  request(graphSearch, async(error, response, html) => {
    if (error) {
      console.log(error);
    }

    const $ = await cheerio.load(html);
    // console.log(html);
    if (JSON.parse(html).itemListElement[0] !== undefined) {
      const knowledgeGraph = `Knowledge Graph for '${argv._[0]}':
          \nName: ${JSON.parse(html).itemListElement[0].result.name}
          \nURL: ${JSON.parse(html).itemListElement[0].result.url}
          \nDescription: ${JSON.parse(html).itemListElement[0].result.detailedDescription ? JSON.parse(html).itemListElement[0].result.detailedDescription.articleBody : JSON.parse(html).itemListElement[0].result.description}
          \nResult Score: ${JSON.parse(html).itemListElement[0].resultScore}
          \n
          `;

      console.log(knowledgeGraph);
    }
  });
}

const getWikipedia = (query) => {
  const wikipediaSearch = {
    url: `https://en.wikipedia.org/wiki/${query}`
  };

  request(wikipediaSearch, async(error, response, html) => {
    if (error) {
      console.log(error);
    }

    const $ = await cheerio.load(html);

    const wikipediaDescription = $('.mw-parser-output p').eq(0).text();

    console.log(`From Wikipedia: ${wikipediaDescription}\n`);
  });
}

const getPageSpeed = (query) => {
  const PS_API = {
    url: `https://www.googleapis.com/pagespeedonline/v2/runPagespeed?url=${query}&key=AIzaSyAaBLhs1pKLTQyGD8CT0N4CSeqM2q-6G7s&strategy=mobile`
  };

  request(PS_API, async(error, response, html) => {
    if (error) {
      console.log(error);
    }

    const json = await JSON.parse(html);
    // console.log(json);

    const ps = `PAGE SPEED for ${json.id}:
      \nTitle: ${json.title}
      \nSpeed: ${json.ruleGroups.SPEED.score}
      \nUsability: ${json.ruleGroups.USABILITY.score}
      \n
      `

    console.log(ps);

  });
}

const getMetadata = (query) => {
  request(query, async(error, response, html) => {
    if (error) {
      console.log(error);
    }

    const $ = await cheerio.load(html);

    const meta = `METADATA for ${query}:
          \nTitle: ${$('meta[name="title"]').attr('content') ? $('meta[name="title"]').attr('content') : 'none'}
          \nKeywords: ${$('meta[name="keywords"]').attr('content') ? $('meta[name="keywords"]').attr('content') : 'none'}
          \nDescription: ${$('meta[name="keywords"]').attr('content') ? $('meta[name="description"]').attr('content') : 'none'}
          \n`

    console.log(meta);
  });
}

const getSearchData = (query) => {
  const googleSearch = {
    url: `https://www.google.com/search?q=${query}`
  };

  request(googleSearch, async(error, response, html) => {
    if (error) {
      console.log(error);
    }

    const $ = await cheerio.load(html);
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
      getPageSpeed(result);

      getMetadata(result);
    }

  });
}

getKnowledgeGraph(argv._[0]);
getWikipedia(argv._[0]);
getSearchData(argv._[0]);