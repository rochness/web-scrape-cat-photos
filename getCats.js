var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var path = require('path');

var catPhotosPath = path.join(__dirname, './catPhotos');
var baseUrl = 'http://www.lolcats.com';

var downloadCatImgsFromPage = function(url) {
  request(url, function(error, response, body) {
    if (error) {
      console.log('error requesting url: ', error);
    } else if(response.statusCode == 200) {
      var imagesToDownload = getListOfCatImgUrls(response.body);
      imagesToDownload.forEach(function(imgUrl) {
        var fileName = catPhotosPath + '/' + getFileNameFromUrl(imgUrl);
        downloadImage(baseUrl + imgUrl, fileName);
      });
    } else {
      console.log('response error requesting url', response.statusCode);
    }
  });
}

var downloadImage = function(imgUrl, fileName) {
  request(imgUrl).pipe(fs.createWriteStream(fileName));
};

var getListOfCatImgUrls = function(html) {
  var $ = cheerio.load(html);
  // cheerio uses jquery-like selectors, all cat images on lolcats.com are nested in div's of the '.picture-container' class
  return Array.prototype.slice.call($('.picture-container img')).map(function(imgElement) {
    return imgElement.attribs.src;
  });
}

var getFileNameFromUrl = function(url) {
  var urlSplit = url.split('/');
  return urlSplit[urlSplit.length - 1];
}

var downloadCatImgsFromFirstTenPages = function() {
  for(var i=1; i<=10; i++) {
    var pageUrl = baseUrl + '/page-' + i + '.html';
    downloadCatImgsFromPage(pageUrl);
  }
}

downloadCatImgsFromFirstTenPages();