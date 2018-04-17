chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getLinks") {
            getLinks(request, sender, sendResponse);
            // this is required to use sendResponse asynchronously
            //return true;            getFollowersLink
        }
    });

function getLinks(request, sender, sendResponse) {
    var hasTMI = "unknown", thirdPartyCapable = "unknown", pixels = "unknown";
    
    //Get the path to this page's clarivoy.js file
    var followersLink = document.querySelectorAll("a[href=\'/danshultz11/followers/\']");    
    var followingLink = document.querySelectorAll("a[href=\'/danshultz11/following/\']");    
    sendResponse( {"numFollowerLinks":followersLink.length, "numFollowingLinks":followingLink.length} );
}