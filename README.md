# sha1Js
Module to calculate SHA1 on input files

# Initialisation code:

```js
import { Elm } from '../Main'
import {Sha1Module} from "../sha1Js/sha1"

document.addEventListener('turbolinks:load', () => {

  let outerElements =  document.getElementsByClassName("are-attachments-in-previous-messages");
  let sha1Elements = document.getElementsByClassName("sha1app");

  for (var i = 0; i < outerElements.length; i++) {    
    let node = outerElements[i];

    let documents = JSON.parse(node.getAttribute('data-documents'));     
    let user = JSON.parse(node.getAttribute('data-user'));     
    let conversation = JSON.parse(node.getAttribute('data-conversation'));   
    let message = JSON.parse(node.getAttribute('data-message'));  

    Elm.Main.init({node: node, flags: {documents: documents, user: user, project_id: conversation.project_id, message: message}  })
   
    let sha1Node = sha1Elements[i];
            // it's initialised here
    var app = Sha1Module.init({
          node: sha1Node
        });
  }
})

```