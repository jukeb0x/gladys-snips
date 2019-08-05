var shared = require('./snips.shared.js');
const PropertiesReader = require('properties-reader');
const prop = PropertiesReader('/home/pi/gladys/api/hooks/snips/conf/intent.properties');


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
            +" dont l'anniversaire est le "+getSlotDateValue(message, "birthdate")+
            " et avec le numéro de téléphone "+getSlotsValue(message, "phonenumber");
      }else if(topic.indexOf('intent') >= 0 && topic.indexOf('updateBirthdayContactToGladysB') >= 0){
        message.input = "Mets à jour la date d'anniversaire du contact "+getSlotValue(message, "contact")
            +" avec la date  "+getSlotDateValue(message, "birthdate");
      }else if(topic.indexOf('intent') >= 0 && topic.indexOf('updateTelephoneContactToGladysB') >= 0){
        message.input = "Mets à jour le numéro de téléphone du contact "+getSlotValue(message, "contact")
            +" avec le numéro  "+getSlotsValue(message, "phonenumber");
      }
      else if(topic.indexOf('intent') >= 0 && topic.indexOf('getContactAnnifToGladysBrain') >= 0){
        message.input = "Quelle est la date d'anniversaire de contact "+getSlotValue(message, "contact")+"?"
      }
else if(topic.indexOf('intent') >= 0 && topic.indexOf('getContactTelToGladysBrain') >= 0){
        message.input = "Quel est le numéro de téléphone de contact "+getSlotValue(message, "contact")+"?"
      }
      else if(topic.indexOf('intent') >= 0 && topic.indexOf('getKnowledgeToGladysBrain') >= 0){
          message.input = "Tu connais knowledge "+getSlotValue(message, "knowledge")
              +" ?";
console.log("message input "+message.input);
      }
      else if(topic.indexOf('intent') >= 0 && topic.indexOf('getLikesToGladysBrain') >= 0){
          message.input = "Tu aimes like "+getSlotValue(message, "likes")
              +" ?";
      }
      else if(topic.indexOf('intent') >= 0 && topic.indexOf('getExperienceToGladysBrain') >= 0){
          message.input = "Tu as déjà experience "+getSlotValue(message, "experience")
              +" ?";
      }
      else if(topic.indexOf('intent') >= 0 && topic.indexOf('deleteItemOnShoppingListToGladysBrain') >= 0){
        message.input = "Supprime l'item "+getSlotValue(message, "item")+",";
      }else if(topic.indexOf('intent') >= 0 && topic.indexOf('addItemOnShoppingListToGladysBrain') >= 0){
	  message.input = "Ajoute ";
	var values=getSlotsValues(message, "item");

	       for(var i = 0; i < values.length; i++) {
	message.input +="l'item "+values[i]+",";
	}
}
	else if(topic.indexOf('intent') >= 0 && topic.indexOf('setPercentSoundToGladysBrain') >= 0){
		  message.input = "Règle le volume du haut parleur à "+getSlotRawValue(message, "percentage");
	      }
	else if(topic.indexOf('intent') >= 0 && topic.indexOf('setTurnOffLightToGladysBrain') >= 0){
		  message.input = "Eteins la lumière de "+getSlotValue(message, "room");
	      }
	else if(topic.indexOf('intent') >= 0 && topic.indexOf('setTurnOnLightToGladysBrain') >= 0){
		  message.input = "Allume la lumière de "+getSlotValue(message, "room");
	      }
	else if(topic.indexOf('intent') >= 0 && topic.indexOf('setPercentLightsToGladysBrain') >= 0){
		  message.input = "Positionne la luminosité à "+getSlotRawValue(message, "percentage");
	      }
	else if(topic.indexOf('intent') >= 0 && topic.indexOf('createAlarmToGladysBrain') >= 0){
		  message.input = "Créé une alarme à "+getSlotValue(message, "time");
	      }





      if(topic.indexOf('intent') >= 0 && topic.indexOf('GladysB') >= 0){
console.log("snips intent "+topic);
	var transco=prop.get(topic);
console.log("snips trasnco "+transco);
	if(transco && transco.length>0){
	message.input=transco;
	}
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

function getSlotDateValue(message, slotName) {

  for(var i = 0; i < message.slots.length; i++) {
    if((message.slots[i].slotName).localeCompare(slotName)===0){
      return message.slots[i].value.value.substring(0,10);

    }

  }
}


function getSlotRawValue(message, slotName) {

  for(var i = 0; i < message.slots.length; i++) {
    if((message.slots[i].slotName).localeCompare(slotName)===0){
      return message.slots[i].rawValue;

    }

  }
}


function getSlotsValue(message, slotName) {
var value="";
  for(var i = 0; i < message.slots.length; i++) {
   // console.log(message.slots[i].slotName+" value number "+message.slots[i].value.value.toString());
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
      values.push(message.slots[i].value.value);

    }

  }

  return values;
}





function classify(message) {
//console.log("message "+JSON.stringify(message));
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

