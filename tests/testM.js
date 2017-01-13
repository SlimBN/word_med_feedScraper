/**
 * Created by ivan on 13-01-2017.
 */

var Scrapper = require('../index');

Scrapper.getMedium("https://hackernoon.com",1,()=>{
  console.log("Sup");
})