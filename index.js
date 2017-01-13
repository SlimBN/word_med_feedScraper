/**
 * Created by ivan on 13-01-2017.
 */

var fs = require("fs");
var https = require('https');
var http = require('http');
var async = require('async');
var cheerio = require('cheerio');
var parseString = require('xml2js').parseString;

module.exports = {
  Medium: function(urlToScrape){
    var feedUrl= urlToScrape+"/feed";
    if (feedUrl.startsWith('https')) {
      https.get(feedUrl, (res)=> {
        var buf = '';
        res.on('data', function(data) {
          buf += data;
        }).on('end', function() {
          callM(buf);
        });
      });
    } else {
      http.get(feedUrl, (res)=> {
        var buf = '';
        res.on('data', function(data) {
          buf += data;
        }).on('end', function() {
          callM(buf);
        });
      });
    }
  },
  Wordpress: function (urlToScrape,pages){
    var url1=urlToScrape+"/feed/";
    var urls = [];
    for (var i=0;i<=(pages-2);i++){
      urls[i]=urlToScrape+"/feed/?paged="+(i+2);
    }
    urls.unshift(url1);

    if (urlToScrape.startsWith('https')) {
    async.map(urls, function(url, cb) {
      https.get(url, function(res) {
        var buf = '';
        res.on('data', function(d) {
          buf += d;
        }).on('end', function() {
          cb(null, buf);
        });
      });
    }, function(err,responses){
        callW(responses);
    });
    } else {
      async.map(urls, function(url, cb) {
        http.get(url, function(res) {
          var buf = '';
          res.on('data', function(d) {
            buf += d;
          }).on('end', function() {
            cb(null, buf);
          });
        });
      }, function(err,responses){
        callW(responses);
      });
    }

  }
}

// fns required by Wordpress fn
function callW(responses) {
  var wordFeedArray = []; // 'd contain final data
  for (var i = 0; i < responses.length; i++) {
    var $ = cheerio.load(responses[i], {
      xmlMode: true
    });
    var xmlFeed = $.html();
    parseString(xmlFeed, function (err, result) {
      if(result.hasOwnProperty('rss')){
        if(result.rss.channel[0].hasOwnProperty('item')){
          wordFeedArray=wordFeedArray.concat(result.rss.channel[0].item); // no of posts in current feed page
          console.log( 'Page '+(i+1)+': '+ wordFeedArray.length );
        }
      }
    });
  }
  wordFeedArray=uniqa(wordFeedArray);
  console.log('wordFeedArray length: '+wordFeedArray.length);
  fs.writeFile( "wordpress.json", JSON.stringify(wordFeedArray), "utf8", ()=>{
    return '';
  });
}

// fns required by Medium fn
function callM(res) {
  var medFeedArray = []; // 'd contain final data
  var $ = cheerio.load(res, {
    xmlMode: true
  });
  var xmlFeed = $.html();
  parseString(xmlFeed, function (err, result) {
    if(result.hasOwnProperty('rss')){
      if(result.rss.channel[0].hasOwnProperty('item')){
        medFeedArray=medFeedArray.concat(result.rss.channel[0].item); // no of posts in current feed page
        console.log( 'Page 1 :'+ medFeedArray.length );
      }
    }
  });
  medFeedArray=uniqa(medFeedArray);
  console.log('medFeedArray length: '+medFeedArray.length);
  fs.writeFile( "medium.json", JSON.stringify(medFeedArray), "utf8", ()=>{
    return '';
  });
}

// universal fns
function uniqa(dayum) {
  var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];
  return dayum.filter(function(item) {
    var type = typeof item;
    if(type in prims){
      return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
    } else{
      return objs.indexOf(item) >= 0 ? false : objs.push(item);
    }
  });
}