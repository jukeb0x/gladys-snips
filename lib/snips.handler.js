var shared = require('./snips.shared.js');

module.exports = function(topic, message){
    var room = message.siteId.toLowerCase()
    try{
      if(topic.indexOf('hotword') >= 0){
        return findUserPerWakeword(message['modelId'])
        .then((userId) => {
          // If user not set, choose the first one
          userId = userId || 1;
          try {
            shared.sessions[room]['user'] = userId;
          } catch(e) {
            shared.sessions[room] = {user: userId, session: false};
          }
        })
      }

/**

Traitement spécial
***/
      if(topic.indexOf('intent') >= 0 && topic.indexOf('pushContactToGladysBrain') >= 0){
        message.input = "Ajoute le contact "+getSlotValue(message, "contact")
            +" dont l'anniversaire est le "+getSlotRawValue(message, "birthdate")+
            " et avec le numéro de téléphone "+getSlotsValue(message, "phonenumber");
      }else if(topic.indexOf('intent') >= 0 && topic.indexOf('updateBirthdayContactToGladysB') >= 0){
        message.input = "Mets à jour la date d'anniversaire du contact "+getSlotValue(message, "contact")
            +" avec la date  "+getSlotRawValue(message, "birthdate");
      }else if(topic.indexOf('intent') >= 0 && topic.indexOf('updateTelephoneContactToGladysB') >= 0){
        message.input = "Mets à jour le numéro de téléphone du contact "+getSlotValue(message, "contact")
            +" avec le numéro  "+getSlotsValue(message, "phonenumber");
      }
      else if(topic.indexOf('intent') >= 0 && topic.indexOf('getContactInfoToGladysBrain') >= 0){
        var ctct=getSlotValue(message, "contact").toLowerCase();
        message.input = message.input.toLowerCase().replace(ctct, "contact "+ctct+"?");
      }
      else if(topic.indexOf('intent') >= 0 && topic.indexOf('getKnowledgeToGladysBrain') >= 0){
          message.input = "Tu connais knowledge "+getSlotValue(message, "knowledge")
              +" ?";
      }
      else if(topic.indexOf('intent') >= 0 && topic.indexOf('getLikesToGladysBrain') >= 0){
          message.input = "Tu aimes like "+getSlotValue(message, "likes")
              +" ?";
      }
      else if(topic.indexOf('intent') >= 0 && topic.indexOf('getExperienceToGladysBrain') >= 0){
          message.input = "Tu as déjà experience "+getSlotValue(message, "experience")
              +" ?";
      }
	else if(topic.indexOf('intent') >= 0 && topic.indexOf('getPreferenceToGladysBrain') >= 0){
          message.input = "Tu préfères "+getSlotValue(message, "like1")
              +" ou "+getSlotValue(message, "like2")+" ?";
      }
      else if(topic.indexOf('intent') >= 0 && topic.indexOf('deleteItemOnShoppingListToGladysBrain') >= 0){
        message.input = "Supprime l'item "+getSlotValue(message, "item");
      }else if(topic.indexOf('intent') >= 0 && topic.indexOf('addItemOnShoppingListToGladysBrain') >= 0){
  message.input = "Ajoute ";
var values=getSlotsValues(message, "item");

       for(var i = 0; i < values.length; i++) {
message.input +="l'item "+value+",";
}
      }else if(topic.indexOf('intent') >= 0 && topic.indexOf('itemsOnShoppingListToGladysBrain') >= 0){
        message.input = "Donne la liste de courses.";
      }
      else if(topic.indexOf('intent') >= 0 && topic.indexOf('flushShoppingListToGladysBrain') >= 0){
        message.input = "Vide la liste de courses.";
      }





      if(topic.indexOf('intent') >= 0 && topic.indexOf('GladysB') >= 0){
        shared.sessions[room]['session'] = message.sessionId;
        message.user = shared.sessions[room]['user'];
        return classify(message);
      }
    } catch(e){
        sails.log.warn(`MQTT : snips handler : fail to handle incoming message on topic ${topic}`);
        sails.log.warn(e);
    };
};



function getSlotValue(message, slotName) {

 for(var i = 0; i < message.slots.length; i++) {
   if((message.slots[i].slotName).localeCompare(slotName)===0){
     return message.slots[i].value.value;

   }

  }
}

function getSlotRawValue(message, slotName) {

  for(var i = 0; i < message.slots.length; i++) {
    if((message.slots[i].slotName).localeCompare(slotName)===0){
      return message.slots[i].value.value.substring(0,10);

    }

  }
}


function getSlotsValue(message, slotName) {
var value="";
  for(var i = 0; i < message.slots.length; i++) {
    console.log(message.slots[i].slotName+" value number "+message.slots[i].value.value.toString());
    if((message.slots[i].slotName).includes(slotName)){
if(message.slots[i].value.value<10) value+='0';
      value+= message.slots[i].value.value.toString();

    }

  }

  return value;
}


function getSlotsValues(message, slotName) {
var values=[];
  for(var i = 0; i < message.slots.length; i++) {
    if((message.slots[i].slotName).includes(slotName)){
      values.add(message.slots[i].value.value);

    }

  }

  return values;
}





function classify(message) {
console.log("message "+JSON.stringify(message));
  message.roomOrigin = message.siteId.replace(/_/g, ' ');
  message.text = message.input;
  message.session = message.siteId;

  for(var i = 0; i < message.slots.length; i++) {
    message[message.slots[i].slotName] = message.slots[i].value.value.toString().toLowerCase();
  }

  console.log("message transmis à gladys "+message.text);
 
  return gladys.user.getById({id: message.user})
  .then((user) => {
    return gladys.brain.classify(user, message);
  });
}

/*
* Find user Id for a given wakeword
*/
function findUserPerWakeword(model) {
  return gladys.param.getValue('SNIPS_WAKEWORDS')
  .then((wakewords) => {
    wakewords = wakewords.split(';');
    for(var i = 0; i < wakewords.length; i++) {
      var res = wakewords[i].split(':');
      if(res[0].split('&').indexOf(model) >= 0) {
        return res[1];
      }
    }
    return false;
  });
}
