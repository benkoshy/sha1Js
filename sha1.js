// SHA1 Module
class sha1Calc {
  constructor(node, callback) {
    this.rootSelector = node;
    this.portCallback = callback;
  }

  fileInputMarkup = `
    <div>
    <form id="SHAUploadForm" action="#" method="POST" enctype="multipart/form-data">      
      <input type="hidden" id="MAX_FILE_SIZE" name="MAX_FILE_SIZE" value="300000" />
      <div>
        <label for="SHAfileInput"> Select files to check if you need to download the above:</label>
        <input type="file" id="SHAfileInput" class="SHAfileInput" name="SHAfileInput[]" multiple="multiple" />
        
      </div>

      <div class="SHAsubmitButton" style="display: none;">
        <button type="submit">Upload Files</button>
      </div>
    </form>
    <p>Files Added</p>
    <div class="fileInfo">&nbsp;</div>
    </div>
  `;

  SelectElem = function(id) {
    return this.rootSelector.querySelector('.'+id)
  }

  Output(msgHtml) {
    var outputDiv = this.SelectElem("fileInfo");
    outputDiv.innerHTML = msgHtml + outputDiv.innerHTML;
    
  }

  SetHtml(markup) {
    var div = document.createElement('div');
    div.innerHTML = markup.trim();
    return div.firstChild; 
  }

  FileDragHover(e) {
      e.stopPropagation();
      e.preventDefault();
      this.rootSelector.className = (e.type == "dragover" ? "hover" : "");
      // e.target.classList.toggle(e.type == "dragover" ? "hover" : "");
  }

  FileSelectHandler(e) {

    // cancel event and hover styling
    this.FileDragHover(e);

    // fetch FileList object
    var files = e.target.files || e.dataTransfer.files;
    
    // process all File objects
    for (var i = 0, f; f = files[i]; i++) {
      this.ParseFile(f);
    }
  }

  ParseFile(file) {
    var data = {
      'filename': file.name,
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
    this.Output(outputHtml);
  }

  InitDragDrop() {
  
    var fileselect = this.SelectElem("SHAfileInput"),
      // filedrag = this.SelectElem("SHAfileDrag"),
      filedrag = this.rootSelector,
      submitbutton = this.SelectElem("SHAsubmitButton");

    // file select
    fileselect.addEventListener("change", this.FileSelectHandler.bind(this), false);

    // file drop
    filedrag.addEventListener("dragover", this.FileDragHover.bind(this), false);
    filedrag.addEventListener("dragleave", this.FileDragHover.bind(this), false);
    filedrag.addEventListener("drop", this.FileSelectHandler.bind(this), false);
    filedrag.style.display = "block";
  }

  render() {
    // Link Stylesheet
    
    // please provide a separate stylesheet
    // because rails is failing - it cannot find the sytlesheet requested.

    // var link = document.createElement('link');  
    // link.rel = 'stylesheet';  
    // link.type = 'text/css'; 
    // link.href = 'style.css';  
    // document.getElementsByTagName('HEAD')[0].appendChild(link);


    // Render file input html and scripts
    // var textnode = document.createTextNode("Hello world: Joble's SHA app");
    var template = this.SetHtml(this.fileInputMarkup);
    this.rootSelector.appendChild(template);
    if (window.File && window.FileList && window.FileReader) {
      this.InitDragDrop();
    }
    else {
      console.error("Error: No File permissions");
    }
  }
}

function Module() {
  this.init = function({node, callback}) {
    var sha1CalcObj = new sha1Calc(node, callback);
    sha1CalcObj.render();
  }
}

var Sha1Module = new Module();

module.exports = { Sha1Module }