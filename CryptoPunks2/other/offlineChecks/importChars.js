
const punks2Abi = require("./punksAbi.js");
const mysql = require('mysql2');
const config = {    "mysql": {
    "host": "punks2.ccack705jqpq.eu-west-2.rds.amazonaws.com",
    "port": 3306,
    "user": "-------",
    "password": "-------",
    "database": "punks2",
    "ssl": "Amazon RDS",
    "connectionLimit": 10
}
};

const attributes = ["Zombie","Alien","Ghost","Black Lipstick","Red Lipstick","Smile","Teeth Smile","Purple Lipstick","Nose Ring","Asian Eyes","Sun Glasses","Yellow Glasses","Round Eyes","Square shades","Left Earring","Right Earring","Two Earrings","Brown Beard","Mustache-Beard","Mustache","Regular Beard","Muttonchops","Mutttonchops Black","Red Mahwak", "Pink Spikes", "Purple Hair", "Green Mahawk", "Red Fuzz", "Bubble Hair", "Emo Hair", "Thin Hair", "Bald", "Blonde Hair", "Messy Hair", "Pony Tails", "Tinfoil hat","Cig","Facemask","Chinmask","Space Helmet"];


const chars = require('./chars.js');

const connection = mysql.createConnection(config.mysql);
console.log(attributes.length);
/*
for(let i=0; i< attributes.length; i++ ){
    let sql = "INSERT INTO attributes (attribute_id, attribute_name) VALUES (" + i.toString() + ",'" + attributes[i] + "')";
    connection.query(sql);
}
*/



processChar(0);


async function processChar(charID) {
    let tokenID = charID+1;
    console.log("CHAR:", charID, tokenID);
    //console.log(chars[charID]);
    let sql = "INSERT INTO chars (tokenid, gender, bg_color) VALUES (" + tokenID + ", '" + chars[charID].gender + "','" + chars[charID].background_color + "')";
    connection.query(sql, async function(){
        if(chars[charID].attributes.length > 0) {
            processAttr(charID, 0);
        } else {
            if(charID< 10000) {
                processChar(parseInt(charID)+1);
            } else{
                console.log("DONE");
            }
        }
    });
}


function processAttr(charID, attrID) {
    let tokenID = charID+1;
    console.log(attributes[chars[charID].attributes[attrID]]);
    let sql2 = "INSERT INTO chars_attribute (tokenid, attribute_id) VALUES (" + tokenID + "," + chars[charID].attributes[attrID] + ")";
    connection.query(sql2, function(){
        if(attrID+1 <chars[charID].attributes.length){
            processAttr(charID, attrID+1);
        } else {
            if(charID < 10000) {
                processChar(parseInt(charID)+1);
            } else {
                console.log("DONE");
            }
        }
    });

}