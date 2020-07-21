// SHA1 Module
function Module() {
  this.rootSelector;

  this.render = function() {
    var textnode = document.createTextNode("Hello world: Joble's SHA app");
    this.rootSelector.appendChild(textnode);
  }
}

Module.prototype.init = function({node}) {
  if (!node) {
    console.warn("Provide a valid DOM object as node in init()");
    return;
  }
  this.rootSelector = node;
  this.render();
  return {
    name: this.name
  }
};

var Sha1Module = new Module();

module.exports = { Sha1Module }