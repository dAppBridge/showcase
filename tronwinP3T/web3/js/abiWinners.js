var winnersABI = [{"constant":false,"inputs":[{"name":"_rnd","type":"uint256"},{"name":"_to","type":"address"}],"name":"awardAirdropPrize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"airdrop_prize","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"mega_prize","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_rnd","type":"uint256"},{"name":"_to","type":"address"}],"name":"awardMegaJackpotPrize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_airdrop_prize","type":"uint256"},{"name":"_mega_prize","type":"uint256"}],"name":"updatePrizes","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"getPrizes","outputs":[{"name":"airdropPrize","type":"uint256"},{"name":"megaPrize","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"rnd","type":"uint256"},{"indexed":false,"name":"by","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"AirdropWon","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"rnd","type":"uint256"},{"indexed":false,"name":"by","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"MegaFundWon","type":"event"}];