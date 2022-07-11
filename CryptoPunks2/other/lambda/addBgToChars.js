const chars = require('./chars.js');
const fs = require('fs');


//default bg: #b7d3ef
// hightlight (1/2000): f7df6d
// silver: (1/1000) d9d9d9
let highlightCount = 0;
let silverCount  = 0;
for(let i=0; i<chars.length; i++) {
    let bgcolor = "b7d3ef";

    let r = Math.floor(Math.random() * Math.floor(2000));
    if(r == 1) {
        bgcolor = "f7df6d";
        highlightCount++;
    }
    r = Math.floor(Math.random() * Math.floor(1000));
    if(r == 1) {
        bgcolor = "d9d9d9";
        silverCount++;
    }

    chars[i].background_color = bgcolor;
}

console.log(chars, highlightCount, silverCount);

let data = JSON.stringify(chars);
fs.writeFileSync('chars-2.json', data);