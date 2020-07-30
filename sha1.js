// SHA1 Module
function Module() {

  const selectElem =  function(id) {
    return document.getElementById(id);
  }

  const setHtml = function(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild; 
  }

  const Output = function(msgHtml) {
    var outputDiv = selectElem("fileInfo");
    outputDiv.innerHTML = msgHtml + outputDiv.innerHTML;
    
  }

  const FileDragHover = function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.target.className = (e.type == "dragover" ? "hover" : "");
  }

  const FileSelectHandler = function(e) {
  
    // cancel event and hover styling
    FileDragHover(e);

    // fetch FileList object
    var files = e.target.files || e.dataTransfer.files;
    
    // process all File objects
    for (var i = 0, f; f = files[i]; i++) {
      ParseFile(f);
    }
  }

  const ParseFile = (file) => {
    const data = {
      'name': file.name,
      'type': file.type || '',
      'size': file.size
    }
    // Callback parent with file data
    if (typeof this.portCallback === "function") {
      this.portCallback(JSON.stringify(data));
    }

    var outputHtml = `
      <p>File name: <strong>${file.name}</strong> 
      type: <strong> ${file.type} </strong> 
      size: <strong> ${file.size} </strong> bytes</p>
      `;
    Output(outputHtml);
  }

  var fileInputMarkup = `
    <div>
    <form id="SHAUploadForm" action="#" method="POST" enctype="multipart/form-data">
      <H3>SHA1 Module - File Upload</H3>
      <input type="hidden" id="MAX_FILE_SIZE" name="MAX_FILE_SIZE" value="300000" />
      <div>
        <label for="SHAfileInput">Files to upload:</label>
        <input type="file" id="SHAfileInput" name="SHAfileInput[]" multiple="multiple" />
        <div id="SHAfileDrag">or drop files here</div>
      </div>

      <div id="SHAsubmitButton">
        <button type="submit">Upload Files</button>
      </div>
    </form>
    <p>Files Added</p>
    <div id="fileInfo">
    </div>
    </div>
    `;

  this.InitDragDrop = function() {
  
    var fileselect = selectElem("SHAfileInput"),
      filedrag = selectElem("SHAfileDrag"),
      submitbutton = selectElem("SHAsubmitButton");

    // file select
    fileselect.addEventListener("change", FileSelectHandler, false);

    // file drop
    filedrag.addEventListener("dragover", FileDragHover, false);
    filedrag.addEventListener("dragleave", FileDragHover, false);
    filedrag.addEventListener("drop", FileSelectHandler, false);
    filedrag.style.display = "block";

    // remove submit button
    submitbutton.style.display = "none";

  }

  this.render = function() {

    // Link Stylesheet
    var link = document.createElement('link');  
    link.rel = 'stylesheet';  
    link.type = 'text/css'; 
    link.href = 'style.css';  
    document.getElementsByTagName('HEAD')[0].appendChild(link);

    // Render file input html and scripts
    // var textnode = document.createTextNode("Hello world: Joble's SHA app");
    var template = setHtml(fileInputMarkup);
    this.rootSelector.appendChild(template);
    if (window.File && window.FileList && window.FileReader) {
      this.InitDragDrop();
    }
    else {
      console.error("Error: No File permissions");
    }
  }
}

Module.prototype.init = function({node, callback}) {
  if (!node) {
    console.warn("Warning: Provide a valid DOM object as node in init()");
    return;
  }
  this.rootSelector = node;
  this.portCallback = callback;
  this.render();
  
  return {
    obj: this
  }
};

var Sha1Module = new Module();

module.exports = { Sha1Module }