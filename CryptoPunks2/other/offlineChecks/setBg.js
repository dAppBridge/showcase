

const mysql = require('mysql2');
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

const connection = mysql.createConnection(config.mysql);
const sharp = require('sharp');



async function startQuery() {
    let sql = "SELECT tokenid, bg_color FROM chars;"
    connection.query(sql,  async function(err, results, fields) {
       // console.log(err, results, fields);
        if(results.length == 0 ) {
            console.log("ALL done");

        } else {
            for(let i=0; i< results.length; i++) {
                console.log("RES:", i, results[i].tokenid, results[i].bg_color);
                let images = [];
                /*const img = {
                    src: `origPunks/image${i+1}.png`,
                    offsetX: 0,
                    offsetY: 0
                    
                };*/

                const img = `origPunks/image${i+1}.png`;

                const outFile =  `newPunks/image${i+1}.png`;
                /*

                if(results[i].bg_color == "b7d3ef") {
                    images.push({src: './bgPlain.png', offsetX: 0, offsetY: 0});
                }
                if(results[i].bg_color == "f7df6d") {
                    images.push({src: './bgGold.png', offsetX: 0, offsetY: 0});
                }
                if(results[i].bg_color == "d9d9d9") {
                    images.push({src: './bgSilver.png', offsetX: 0, offsetY: 0});
                }
                */

                images.push(img);

                
                let color = results[i+1].bg_color;

                await mergeImagesToPng(images, outFile, color);
            }
            
        }
    });
}

async function mergeImagesToPng(images, output, bgcolor) {

    console.log(images[0], output);

    await
        sharp(images[0]).flatten({background: `#${bgcolor}`}).toFile(output);

    return;

  }


startQuery();