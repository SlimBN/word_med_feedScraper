/**
 * Created by ivan on 13-01-2017.
 */

var Scrapper = require('../index');

Scrapper.getMedium("https://hackernoon.com", 0, (data) => {
    console.log('Your data is '+ data.length+'" long, but is yours?');
});

console.log("hello it's me your meme");
