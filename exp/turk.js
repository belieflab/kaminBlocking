/* enable TurkPrime integration */

function getParamFromURL(name) {
  name = name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
  var regexS = "[\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}



// Take the user to a random URL, selected from the pool below 
var link = ["index.php"+"?workerId="+workerId];

function randomizeURL(linkArray) {
  window.location=linkArray[Math.floor(Math.random()*linkArray.length)];
}

randomizeURL(link);