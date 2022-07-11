const chars = require('chars.js');
const mysql = require('mysql2/promise');
const config = {    "mysql": {
    "host": "punks2.ccack705jqpq.eu-west-2.rds.amazonaws.com",
    "port": 3306,
    "user": "----",
    "password": "----",
    "database": "punks2",
    "ssl": "Amazon RDS",
    "connectionLimit": 10
}
};



exports.handler = async (event) => {

    const connection = await mysql.createConnection(config.mysql);

    const { id } = event;
    const rawPathParts = event['rawPath'].split("/");
    let attributes = ["Zombie","Alien","Ghost","Black Lipstick","Red Lipstick","Smile","Teeth Smile","Purple Lipstick","Nose Ring","Asian Eyes","Sun Glasses","Yellow Glasses","Round Eyes","Square shades","Left Earring","Right Earring","Two Earrings","Brown Beard","Mustache-Beard","Mustache","Regular Beard","Muttonchops","Mutttonchops Black","Red Mahwak", "Pink Spikes", "Purple Hair", "Green Mahawk", "Red Fuzz", "Bubble Hair", "Emo Hair", "Thin Hair", "Bald", "Blonde Hair", "Messy Hair", "Pony Tails", "Tinfoil hat","Cig","Facemask","Chinmask","Space Helmet"];

    let punkID = rawPathParts[rawPathParts.length-1];
    if(punkID == "latest") {
        let latestOut = {
            err: "",
            latestMints: []
        }
        let sql = "SELECT tokenid FROM punks2_minted ORDER BY block DESC LIMIT 1000;";
        const [rows, fields] = await connection.execute(sql);
        for(let i=0; i< rows.length; i++) {
            latestOut.latestMints.push(
                { 
                    tokenid: rows[i].tokenid,
                    bg: chars[rows[i].tokenid-1].background_color
                });
        }
        return {
            statusCode: 200,
            contentType: "application/json",
            headers: {"content-type": "application/json", "Access-Control-Allow-Origin": "*"},
            body: JSON.stringify(latestOut),
        };


    }    
        let response;
        
        if(punkID >0 && punkID < 10001) {
            //punkID++;
            let output =   {
                "description": "The next generation of Punks!", 
                "external_url": "https://cryptopunks2.com/punks2/?id=" + punkID, 
                "image": "https://cryptopunks2.com/punks2/img/image" + punkID + ".png", 
                "name": "Crypto Punks2 #" + punkID,
                
                "attributes": [] ,
                "attributeCounters": []
            };
            
            
            // now get the rarity scores...
            let sql = "SELECT COUNT(*) as total_mints FROM punks2_minted;";
            let totalMints = 0;
            const [rows, fields] = await connection.execute(sql);
            
            if(rows.length > 0) {
                totalMints = rows[0].total_mints;
            }
            
            output.totalMints = totalMints;
            
            sql = "SELECT COUNT(tokenid) as total_usage, attribute_id FROM chars_attribute ";
            sql += "WHERE attribute_id IN (SELECT attribute_id FROM chars_attribute WHERE tokenid = " + punkID + ")"
            sql += "AND tokenid IN (SELECT tokenid FROM punks2_minted)"
            sql += "GROUP BY attribute_id;";
            const [rows2, fields2] = await connection.execute(sql);
            for(let i=0; i< rows2.length; i++) {
               output.attributeCounters.push({"attribute_id": rows2[i].attribute_id, "total_usage": rows2[i].total_usage});
            }
            
            // gender and bgcolor...
            sql = "SELECT count(tokenid) as total_usage FROM chars WHERE gender = (SELECT gender FROM chars WHERE tokenid= " + punkID + ")"
            sql += "AND tokenid IN (SELECT tokenid FROM punks2_minted)"
            sql += "UNION ALL " 
            let bgPunkId = punkID;
            bgPunkId++; // offsett to fix BG colors
            sql += "SELECT count(tokenid) as total_usage FROM chars WHERE bg_color = (SELECT bg_color FROM chars WHERE tokenid= " + bgPunkId + ")"
            sql += "AND tokenid IN (SELECT tokenid+1 FROM punks2_minted);";
            const [rows3, fields3] = await connection.execute(sql);
            output.genderUsage = rows3[0].total_usage;
            output.bgUsage = rows3[1].total_usage;
            
            
            
            output.background_color =  chars[punkID].background_color;
            
            let bgType;
            if(chars[punkID].background_color.toLowerCase() == "b7d3ef")
                bgType = "Standard Background";

            if(chars[punkID].background_color.toLowerCase() == "f7df6d")
                bgType = "Gold Background";

            if(chars[punkID].background_color.toLowerCase() == "d9d9d9")
                bgType = "Silver Background";
            
            punkID--;
            output.attributes.push({"trait_type": "type", "value": chars[punkID].gender});
            
            if(chars[punkID].attributes){
                for(let c=0; c< chars[punkID].attributes.length; c++) {
                    output.attributes.push({"trait_type": "attribute", "value": attributes[chars[punkID].attributes[c]], "attribute_id": chars[punkID].attributes[c]});
                }
            }
            


            output.attributes.push({"trait_type": "attribute", "value": bgType});

            
            response = {
                statusCode: 200,
                headers: {"content-type": "application/json", "Access-Control-Allow-Origin": "*"},
                body: JSON.stringify(output),
            };
            
        } else {
            response = {
                    statusCode: 404,
                    
                    body: "NOT FOUND",
                };
        }
        return response;
    
};
