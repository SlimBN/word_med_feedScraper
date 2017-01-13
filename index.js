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
  getMedium: function(urlToScrape,rms,callB){
    var feedUrl= urlToScrape+"/feed";
    if (feedUrl.startsWith('https')) {
      https.get(feedUrl, (res) => {
        var buf = ''
        res.on('data', function(data) {
          buf += data;
        }).on('end', function() {
          if(rms===0){
            var data = callM(buf,rms);
            callB(data);
          } else {
            callM(buf,rms);
          }
        });
      })
    } else {
      http.get(feedUrl, (res)=> {
        var buf = '';
        res.on('data', function(data) {
          buf += data;
        }).on('end', function() {
          if(rms===0){
            var data = callM(buf,rms);
            callB(data);
          } else {
            callM(buf,rms);
          }
        });
      });
    }
  },
  getWordpress: function (urlToScrape,pages,rms,callB){
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
        if(rms===0){
          var data = callW(responses,rms);
          callB(data);
        } else {
          callW(responses,rms);
        }
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
          if(rms===0){
          var data = callW(responses,rms);
          callB(data);
          } else {
            callW(responses,rms);
          }
      });
    }
  }
}

// fns required by Wordpress fn
function callW(responses,rms) {
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
  if(rms===0){
    return wordFeedArray;
  }else{
    fs.writeFile( "wordpress.json", JSON.stringify(wordFeedArray), "utf8", ()=>{
      return '';
    });
  }
}

// fns required by Medium fn
function callM(res,rms) {
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
  if(rms===0){
    return medFeedArray;
  }else{
    fs.writeFile( "medium.json", JSON.stringify(medFeedArray), "utf8", ()=>{
      return '';
    });
  }
}

// universal fns
// uniqa to only keep unique items in an array
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