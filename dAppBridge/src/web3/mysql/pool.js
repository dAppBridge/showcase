var config = require('config'),
    mysql = require('mysql')



let connectionConfig = {};

if(config.use_testnet = true)
  connectionConfig = config.testnet;
else
  connectionConfig = config.prod;

var options = connectionConfig.mysql || {};

var connectionPool = mysql.createPool(options);

module.exports.getConnection = function getConnection(callback){

    connectionPool.getConnection(function(err, connection){

        if(err){
            //winston.error('[mysql/getConnection] ' + util.inspect(err));
            return callback(err);
        }

        return callback(null, connection, function(){

            try{

                if(err){
                    connection.destroy();
                } else {
                    connection.release();
                }

            } catch(err){
              //  winston.error('[mysql/getConnection] ' + util.inspect(err));
                callback(err);
            }
        });
    });
}