var toggle = false;
var pages;
getPages();
chrome.browserAction.onClicked.addListener(function(tab) {
  toggle = !toggle;
  if(toggle){
    chrome.browserAction.setIcon({path: "robit_19.png", tabId:tab.id});
    // chrome.tabs.executeScript(tab.id, {file:"SCRIPT.user.js"});
  }
  else{
    chrome.browserAction.setIcon({path: "robit_sleep_19.png", tabId:tab.id});
    chrome.tabs.executeScript(tab.id, {code:"alert()"});
  }
});

console.log('background js');
// Create rightclick context menu "Add New Note" option
chrome.runtime.onInstalled.addListener(function() {
  var context = "selection";
  var title = "Add New Note";
  var id = chrome.contextMenus.create({"title": title,"contexts":["all"]});
});

// add click event
chrome.contextMenus.onClicked.addListener(onClickHandler);

// The onClicked callback function.
function onClickHandler(info, tab) {
  chrome.tabs.sendRequest(tab.id, "getClickedEl", function(clickedEl) {
        Promise.resolve($.post('http://localhost:1337/api/note',clickedEl)).then(function(res){
          console.log('response: ',res);
          console.log('response data: ',res.data);
        }).then(null,function(){});
        // console.dir(clickedEl);
    });
  // var sText = info.selectionText;
  // var url = "https://www.google.com/search?q=" + encodeURIComponent(sText);
  // window.open(url, '_blank');
}


function getPages(){
  Promise.resolve($.get('http://localhost:1337/api/page')).then(function(mongoPages){
    console.log('pages received',mongoPages);
    mongoPages=pages;
  });
}