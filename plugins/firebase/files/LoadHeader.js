import DocToHeader from './DocToHeader.js';

var LoadHeader = function (fileID) {
    var ownerID = this.ownerInfo.userID;
    let header = this.cacheHeaders[fileID];
    if (header && (header.ownerID === ownerID)) {
        return Promise.resolve(header);
    }

    // Can't find in local headers, load from firestore    
    var self = this;
    return this.getFileQuery(ownerID, fileID, 'header').limit(1)
        .get()
        .then(function (querySnapshot) {
            let header = undefined;
            querySnapshot.forEach(function (doc) {
                header = DocToHeader(doc);
                self.cacheHeaders[fileID] = header;
            });
            return Promise.resolve(header);
        });
}

export default LoadHeader;