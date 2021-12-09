# sha1Js
Module to calculate SHA1 on input files, which are dragged and dropped.

A json payload containing the sha1 of the files dragged and dropped is passed to a function given to the app on instantiation. This function is a port which is listened to by my elm app.

### Running a simple server

[If you don't have one handy try installing here](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server)

```terminal
python -m SimpleHTTPServer
```

### How am I instantiating:

I will pass in a function to your app. This function will be a part which will allow my elm app to receive a javascript payload produced by your code, which calculates Sha1s etc. The payload must conform to the following interface:


```elm
metaDataDecoder : Decode.Decoder FileMetaData
metaDataDecoder =
  Decode.map4 FileMetaData
    (Decode.field "size" Decode.int)
    (Decode.field "filename" Decode.string)
    (Decode.field "sha1" Decode.string)
    (Decode.oneOf [Decode.field "type" Decode.string, Decode.succeed "NA"])
```

You can see below how I will be instantiating your app, and functions that will be passed to it.

```js


  /*    // random data helpful in debugging
      	let documents = [{"id":1,"message_id":5,"file_data":{"id":"projects/1/document/1/file/df84d002ed79eb01fdb01c1a66aec101.png","storage":"store","metadata":{"sha1":"4c931a551a9825df6fd5772383d9df66ba685e3c","size":21636,"filename":"Dass_results_final.png","mime_type":"image/png"}},"created_at":"2020-07-29T06:01:09.387Z","updated_at":"2020-07-29T06:01:09.585Z","file_sha1":"4c931a551a9825df6fd5772383d9df66ba685e3c","token":"VcBWxvHGWLZApomB3sPWfRri","file_size":21636,"project_id":"1"}]
          let user = {"id":1,"email":"brian@queen.com","crypted_password":"$2a$10$cfmLz2Pv8Aa3nn9tjAC7auMobR48q75X1hgG0zjZ94WhWUl5K.rHm","salt":"hq3Hsc8P5L4j27szRakz","created_at":"2020-07-28T09:01:06.058Z","updated_at":"2020-07-28T09:01:06.058Z","first_name":"Brian","last_name":"May","organisation_id":1,"remember_me_token":null,"remember_me_token_expires_at":null,"reset_password_token":null,"reset_password_token_expires_at":null,"reset_password_email_sent_at":null,"access_count_to_reset_password_page":0,"invitations_count":20000,"site_admin":true,"activation_state":"pending","activation_token":"dX9CPcDnnf6fri3hxByr","activation_token_expires_at":null,"organisation_admin":true}        
          let message = {"id":5,"subject":"test","body":"\u003cdiv\u003etest\u003c/div\u003e","user_id":1,"conversation_id":1,"created_at":"2020-07-29T06:01:09.356Z","updated_at":"2020-07-29T06:01:09.356Z","index_no":5}
          let conversation = {"id":1,"subject":"I Married a Forbidden Wolves - 1","created_at":"2020-07-28T09:01:28.616Z","updated_at":"2020-07-29T08:00:03.628Z","project_id":1,"is_open":true,"correspondence_type":"rfi","token":"Zq8kTeuDxiG4N3oWyjGiJQuF","pdf_data":{"id":"conversation/1/pdf/e32ba146a5e664443d5cdb14e46903d7.pdf","storage":"store","metadata":{"size":8262,"filename":"Conversation: I Married a Forbidden Wolves - 1 as at July 29 2020 6:00 PM +1000.pdf","mime_type":"application/pdf"}},"index_no":1}       
          */

import { Controller } from "@hotwired/stimulus"

import { Elm } from '../Main'
import {Sha1Module} from "../sha1Js/sha1"

export default class extends Controller {

  static targets = [ "sha1App", "elmApp"]

  connect(){
    this.setUpElmAppAndJoblesApp()    
  }

  setUpElmAppAndJoblesApp(){
      let node = this.elmAppTarget
      let documents = JSON.parse(node.getAttribute('data-documents'))
      let user = JSON.parse(node.getAttribute('data-user'))
      let conversation = JSON.parse(node.getAttribute('data-conversation'))
      let message = JSON.parse(node.getAttribute('data-message'))
    let elmApp = Elm.Main.init({node: node, flags: {documents: documents, user: user, project_id: conversation.project_id, message: message}  })    


      if (documents.length > 0) {
          let joblesApp = Sha1Module.init({
            node: this.sha1AppTarget,
            callback: passShaToElm
          })

          function passShaToElm(json_payload){ 
            elmApp.ports.fileReceiver.send(JSON.parse(json_payload))
          }
      }
  }
}
```

### Stimulus Used to Show Hide Finger print information

* We are using a stimulus controller to show and hide the file information table.