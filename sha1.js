// I need to load the worker file somehow
// from webpacker. 
// So I have removed the file reference you were previously using.
// import Worker from './sha1.worker.js';

class sha1Calc {
  constructor(node, callback) {
    this.rootSelector = node;
    this.portCallback = callback;
    this.file_id = 1;
  }

  fileInputMarkup = `
    <div>
    <form class="SHAUploadForm" action="#" method="POST" enctype="multipart/form-data">      
      <input type="hidden" id="MAX_FILE_SIZE" name="MAX_FILE_SIZE" value="300000" />
      <div>        
        <input type="file"  class="SHAfileInput" name="SHAfileInput[]" multiple="multiple" />        
      </div>
      <div class="SHAsubmitButton" style="display: none;">
        <button type="submit">Upload Files</button>
      </div>
    </form>    
    <div class="fileInfo" style="padding-top:10px"></div>
    </div>
  `;

  selectElemByClass = function(className) {
    return this.rootSelector.querySelector('.'+className)
  }

  selectElemById = function(id) {
    return this.rootSelector.querySelector('#'+id)
  }

  selectFlex = function(selector) {
    return this.rootSelector.querySelector(selector)
  }

  output(msgHtml) {
    var outputDiv = this.selectElemByClass("fileInfo");
    if(outputDiv.firstChild != null){    
      outputDiv.firstChild.insertAdjacentHTML("beforeBegin",msgHtml);
    }else{
      outputDiv.innerHTML =  outputDiv.innerHTML + msgHtml;
    }
    
  }

  setHtml(markup) {
    var div = document.createElement('div');
    div.innerHTML = markup.trim();
    return div.firstChild; 
  }

  fileDragHover(e) {
      e.stopPropagation();
      e.preventDefault();
      this.rootSelector.className = (e.type == "dragover" ? "hover" : "rootSelector");
  }

  handleWorkerEvent(e) {
    // Worker invoked event; can be used for intial tasks 
    return;
  }

  handleWorkerResult(event) {
    var hashPlaceholder, result, progressBar;
    result = event.data;

    if (result.type == 'progress') {
      progressBar = this.selectFlex('#sha1_file_hash_' + result.file_id + ' .bar')
      console.log(result.progress);
      if(result.progress>10){
        progressBar.style.width = result.progress + 'px';
      }else{
        progressBar.style.width = '5px';
      }  
      return;
    }

    hashPlaceholder = this.selectElemById('sha1_file_hash_' + result.block.file_id);
    if (hashPlaceholder) {
      hashPlaceholder.parentNode.innerHTML='<div class="alert alert-success">'+result.hash + ' (' + result.duration + 's)</div>';
    }

    delete result.block.file_id;
    var passData = {
      ...result.block,
      'sha1': result.hash,
    }
    // Callback parent with file data
    if (typeof this.portCallback === "function") {
      this.portCallback(JSON.stringify(passData));
    }

  }

  hashFile(file, workers, block) {
    for(let i = 0; i < workers.length; i += 1) {
      workers[i].postMessage({
        'block': block,
        'file': file
      });
      workers[i].addEventListener('message', this.handleWorkerResult.bind(this));
    }
  }

  fileSelectHandler(e) {
    var self = this;
    
    function traverseFileTree(item, path) {
      path = path || "";
      
      if (item.isFile) {
        // Get file
        item.file(function(file) {
          self.processFile(file);
        });
      } else if (item.isDirectory) {
        // Get folder contents
        var dirReader = item.createReader();
        dirReader.readEntries(function(entries) {
          for (var i=0; i<entries.length; i++) {
            traverseFileTree(entries[i], path + item.name + "/");
          }
        });
      }
    }

    var items = e.dataTransfer.items;

    for (var i=0; i<items.length; i++) {
      // webkitGetAsEntry is where the magic happens
      var item = items[i].webkitGetAsEntry();
      if (item) {
        traverseFileTree(item);
      }
    }

    // cancel event and hover styling
    this.fileDragHover(e);

  }

  processFile(file) {
    var workers, worker, output, block;
    output = [];
    workers = [];
    output.push('<tr><td class="" style="width:20%"><strong>', file.name, '</strong></td><td style="width:80%"> (', file.type || 'n/a', ') - ', (file.size  / 1024 / 1024).toFixed(2), ' MB</td></tr>');

    output.push('<tr>', '<td>SHA-1</td><td> <div class="progress" style="margin-bottom: 0px" id="sha1_file_hash_', this.file_id, '"><div class="progress-bar progress-bar-striped bar" style="width: 2%;"></div></div></td></tr>');

    worker = new Worker('sha1.worker.js');
    worker.addEventListener('message', this.handleWorkerEvent('sha1_file_hash_' + this.file_id));
    workers.push(worker);

    block = {
      'filename': file.name,
      'type': file.type || 'n/a',
      'size': file.size,
      'file_id': this.file_id
    }

    this.hashFile(file, workers, block);
    this.file_id += 1;
    this.output('<table class="table table-striped table-hover">' + output.join('') + '</table>');
  }

  initDragDrop() {
  
    var fileselect = this.selectElemByClass("SHAfileInput"),
    // filedrag = this.selectElemByClass("SHAfileDrag"),
    filedrag = this.rootSelector,
    submitbutton = this.selectElemByClass("SHAsubmitButton");

    // file select
    fileselect.addEventListener("change", this.fileSelectHandler.bind(this), false);

    // file drop
    filedrag.addEventListener("dragover", this.fileDragHover.bind(this), false);
    filedrag.addEventListener("dragleave", this.fileDragHover.bind(this), false);
    filedrag.addEventListener("drop", this.fileSelectHandler.bind(this), false);
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
    var template = this.setHtml(this.fileInputMarkup);
    this.rootSelector.appendChild(template);
    this.rootSelector.classList.add('rootSelector')
    
    if (window.File && window.FileList && window.FileReader) {
      this.initDragDrop();
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
// export {Sha1Module as Sha1Module}