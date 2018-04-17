// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, (tabs) => {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * Change the background color of the current page.
 *
 * @param {string} color The new background color.
 */
function changeBackgroundColor(color) {
  var script = 'document.body.style.backgroundColor="' + color + '";';
  // See https://developer.chrome.com/extensions/tabs#method-executeScript.
  // chrome.tabs.executeScript allows us to programmatically inject JavaScript
  // into a page. Since we omit the optional first argument "tabId", the script
  // is inserted into the active tab of the current window, which serves as the
  // default.
  chrome.tabs.executeScript({
    code: script
  });
}

function goToMyInstagramPage(){
    var name = document.getElementById('txtName').value
    if(!!name){
        chrome.tabs.getSelected(function(tab){
            tabId = tab.id;
            chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab2){
                tabId==tab2.id && !!changeInfo.favIconUrl && window.setTimeout(function(){
                    doLinksExist(changeInfo.status)                    
                },1000 );
            })
            chrome.tabs.update(tabId, ({url:"https://www.instagram.com/" + name}));
            document.getElementById('lblSpecialMessage').innerText = ""
            return;
        });
    }    
    document.getElementById('lblSpecialMessage').innerText = "You must enter your Instagram name";
    document.getElementById('txtName').focus();
}

/**
 * Gets the saved background color for url.
 *
 * @param {string} url URL whose background color is to be retrieved.
 * @param {function(string)} callback called with the saved background color for
 *     the given url on success, or a falsy value if no color is retrieved.
 */
function getSavedBackgroundColor(url, callback) {
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
  // for chrome.runtime.lastError to ensure correctness even when the API call
  // fails.
  chrome.storage.sync.get(url, (items) => {
    callback(chrome.runtime.lastError ? null : items[url]);
  });
}

/**
 * Sets the given background color for url.
 *
 * @param {string} url URL for which background color is to be saved.
 * @param {string} color The background color to be saved.
 */
function saveBackgroundColor(url, color) {
  var items = {};
  items[url] = color;
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We omit the
  // optional callback since we don't need to perform any action once the
  // background color is saved.
  chrome.storage.sync.set(items);
}


    var showFollowingButton;
    var closeDialogButton;
    var doLinksExistButton;
    
document.addEventListener('DOMContentLoaded', () => {
  //Short-circuit the form submit - we can't have our form posting, but we need it to wire up the input & button click
  var onlyForm = document.getElementById("form1")
  onlyForm.addEventListener("submit", function(){ event.preventDefault(); return false;})
  
  document.getElementById('txtName').focus();
  getCurrentTabUrl((url) => {
    var goButton = document.getElementById('goButton')
    goButton.addEventListener("click", goToMyInstagramPage);
  });
  
    showFollowingButton = document.getElementById('showFollowing')
    showFollowingButton.addEventListener("click", clickFollowing);
    closeDialogButton = document.getElementById('closeDialog')
    closeDialogButton.addEventListener("click", closeDialog);
    doLinksExistButton = document.getElementById('doLinksExist')
    doLinksExistButton.addEventListener("click", doLinksExist);
});

var tabId = 0;

function clickFollowing(){
    chrome.tabs.executeScript(tabId, 
    {code: 'var followingLink = document.querySelectorAll("a[href=\'/danshultz11/followers/\']")[0];followingLink.click();' }
    )   
}

function closeDialog(){
    chrome.tabs.executeScript(tabId, 
    {code: 'var dialogX = document.querySelectorAll("div[role=\'dialog\']")[0];dialogX.click();' }
    )   
}

function doLinksExist(status){
    chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
        chrome.tabs.sendMessage(tabId>0 ? tabId : tab[0].id, {action: "getLinks"}, function(response) {
            if(!!response && response.numFollowerLinks > 0  && response.numFollowingLinks > 0){
                console.log("status=" + status)
                showFollowingButton.style.display="block";
                closeDialogButton.style.display="block";
                document.getElementById('lblSpecialMessage').innerText = "";
                return;
            }
            document.getElementById('lblSpecialMessage').innerText += status// + "Followers unavailable - make sure you are logged into Instagram";
        });
    });    
}
