
suite = oc.crypto.rsa_sha256_chaum86;
api = new oc.api(suite);
issuer_private = suite.makeKey(1024);
issuer_public = issuer_private.getPublicKey();

function newStorage() {
    return {
        'message_queue':{'next_id':0},
        'cddcs':{},
        'mintkeys':{'denominations':{}},
        'validation':{},
        'private_keys':{},
        'coins':{},
    } 
}


var server = new oc.layer(api,newStorage());
server.storage.dsdb = {};


params = {};
params.cdd_location = 'http://opencent.org';
params.cdd_serial = 1;
params.cdd_signing_date = new Date("2012-12-30T11:46:00");
params.cdd_expiry_date = new Date("2014-12-31T23:59:59");
params.currency_name = 'OpenCent';
params.currency_divisor = 100;
params.validation_service = [[10,'http://opencent.org'],
                             [20,'http://opencent.com/validate']];
params.info_service =  [[10,'http://opencent.org']];
params.renewal_service =  [[10,'http://opencent.org']];
params.invalidation_service =  [[10,'http://opencent.org']];
params.denominations=[1,2,5];
params.additional_info='';

var cddc = api.makeCDDC(issuer_private,params);
server.addCDDC(cddc);


params = {};
params.denomination = 1;
params.notBefore = new Date("2013-01-01");
params.notAfter = new Date("2013-06-30");
params.coins_expiry_date = new Date('2013-12-31');
mkout = api.makeMKC(issuer_private,cddc,params);
mkc = mkout.mkc;
private_mintkey = mkout.private_mintkey;
server.addMKC(mkc,private_mintkey);

params = {};
params.denomination = 2;
params.notBefore = new Date("2013-01-01");
params.notAfter = new Date("2013-06-30");
params.coins_expiry_date = new Date('2013-12-31');
mkout2 = api.makeMKC(issuer_private,cddc,params);
mkc2 = mkout2.mkc;
private_mintkey2 = mkout2.private_mintkey;
server.addMKC(mkc2,private_mintkey2);

params = {};
params.denomination = 5;
params.notBefore = new Date("2013-01-01");
params.notAfter = new Date("2013-06-30");
params.coins_expiry_date = new Date('2013-12-31');
mkout3 = api.makeMKC(issuer_private,cddc,params);
mkc3 = mkout3.mkc;
private_mintkey3 = mkout3.private_mintkey;
server.addMKC(mkc3,private_mintkey3);




var http = require('http');
var url = require('url') ;

http.createServer(
    function (request, response) {
        var full_url = url.parse( request.url, true ) ;
        var pathname = full_url.pathname ;
        var q_params = full_url.query ;
        var body = "" ;
        
        response.statusCode=200;
        response.setHeader('Content-Type','text/plain');
        response.setHeader("Access-Control-Allow-Origin", "*");
        

        if (request.method === "POST"){

            request.on('data', function( chunk ) {
                // append the chunk to the growing message body
                body += chunk ;
            }) ;

            request.on('end', function(){
                try {
                    mdata = JSON.parse(body);
                    res = server.dispatch(mdata);
                    response.write(res.toJson());
                    response.end();
                } catch (e) {
                    response.write('error\n\n' +e);
                    response.end();
    
                }
            }) ;
        } else {
            request.on('end',function() {
                response.write('Welcome to the opencoin issuer.');
                response.end();
            
            });    
        }
    }).listen(6789);

console.log('Server running at http://127.0.0.1:6789/');





