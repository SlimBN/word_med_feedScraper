### X Scraper 
#### Use:

**Install:** 
````
npm install --save wmscraper
````

There are two available methods: getWordpress & getMedium

- getMedium(url, file/obj param, callback)

		var Scrapper = require('../index');

    	Scrapper.getMedium("https://hackernoon.com", 0, (data) => {
        	console.log('Your data is '+ data.length+'" long, but is yours?');
    	});

    	console.log("hello it's me your meme");
        
- getWordpress(url, pages, file/obj param, callback)
		
		var Scrapper = require('../index');

        Scrapper.getWordpress("https://wroops.com", 20, 0, (data) => {
                console.log('Your data is '+ data.length+'" long, but is yours?');
        });

        console.log("hello it's me your meme");

        
**file/obj param** : setting 0 returns a object that you can use in callback function, anything other than 0 creates a json file with the retrieved list of post data.

**pages**: sets number of pages you want to retrive for a wordpress blog 

