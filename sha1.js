// SHA1 Module
class sha1Calc {
  constructor(node, callback) {
    this.rootSelector = node;
    this.portCallback = callback;

    this.chunkSize = 64 * 1024 * 1024;
    this.hasher = null;
  }

  hashChunk(chunk) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async(e) => {
        const view = new Uint8Array(e.target.result);
        this.hasher.update(view);
        resolve();
      };
  
      fileReader.readAsArrayBuffer(chunk);
    });
  }

  readFile = async(file) => {
    console.log('readFile')
    if (this.hasher) {
      this.hasher.init();
    } else {
      this.hasher = await hashwasm.createMD5();
    }
  
    const chunkNumber = Math.floor(file.size / this.chunkSize);
  
    for (let i = 0; i <= chunkNumber; i++) {
      const chunk = file.slice(
        this.chunkSize * i,
        Math.min(this.chunkSize * (i + 1), file.size)
      );
      await this.hashChunk(chunk);
    }
  
    const hash = this.hasher.digest();
    return Promise.resolve(hash);
  };

  fileInputMarkup = `
    <div>
    <form class="SHAUploadForm" action="#" method="POST" enctype="multipart/form-data">      
      <input type="hidden" id="MAX_FILE_SIZE" name="MAX_FILE_SIZE" value="300000" />
      <div>
        <label> Select files to check if you need to download the above:</label>
        <input type="file"  class="SHAfileInput" name="SHAfileInput[]" multiple="multiple" />
        
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
    outputDiv.innerHTML =  outputDiv.innerHTML + msgHtml;
    
  }

  SetHtml(markup) {
    var div = document.createElement('div');
    div.innerHTML = markup.trim();
    return div.firstChild; 
  }

  FileDragHover(e) {
      e.stopPropagation();
      e.preventDefault();
      this.rootSelector.className = (e.type == "dragover" ? "hover" : "rootSelector");
  }

  async FileSelectHandler(e) {

    // cancel event and hover styling
    this.FileDragHover(e);

    // fetch FileList object
    var files = e.target.files || e.dataTransfer.files;
    
    // process all File objects 
    for (var i = 0, f; f = files[i]; i++) {
      await this.ParseFile(f);
    }
  }

  async ParseFile(file) {
    // resultElement.innerHTML = "Loading...";
    const start = Date.now();
    const hash = await this.readFile(file);
    const end = Date.now();
    const duration = end - start;
    const fileSizeMB = file.size / 1024 / 1024;
    const throughput = fileSizeMB / (duration / 1000);

    var fileInfoHtml = `
      <p>File name: <strong>${file.name}</strong> 
      type: <strong> ${file.type || ''} </strong> 
      size: <strong> ${file.size} </strong> bytes
      duration: <strong> ${duration} </strong> ms
      throughput: <strong> ${throughput.toFixed(2)} </strong> MB/s
      SHA1: <strong> ${hash} </strong> </p>
      `;
    this.Output(fileInfoHtml);

    
    var finalData = {
      'filename': file.name,
      'type': file.type || '',
      'size': file.size,
      'sha1': hash,
    }

    // Callback parent with file data
    if (typeof this.portCallback === "function") {
      this.portCallback(JSON.stringify(finalData));
    }
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
    this.rootSelector.classList.add('rootSelector')
    
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