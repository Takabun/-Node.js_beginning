const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring'); //★追加

const index_page = fs.readFileSync('./index.ejs', 'utf8');
const other_page = fs.readFileSync('./other.ejs', 'utf8');
const style_css = fs.readFileSync('./style.css', 'utf8');

var server = http.createServer(getFromClient);

server.listen(3000);
console.log('Server start!');

// ここまでメインプログラム==========

// createServerの処理
function getFromClient(request, response){
    var url_parts = url.parse(request.url, true); //★trueに

    switch (url_parts.pathname) {
         
        case '/':
            response_index(request, response); //★修正
            break;

        case '/other':
            response_other(request, response); //★修正
            break;

        case '/style.css':
            response.writeHead(200, {'Content-Type': 'text/css'});
            response.write(style_css);
            response.end();
            break;

        default:
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end('no page...');
            break;
    }
}

// データ
var data = {msg:'no message...'};

// indexのアクセス処理
function response_index(request, response){
    // POSTアクセス時の処理
    if (request.method == 'POST'){
        var body='';

        // データ受信のイベント処理
        request.on('data', (data) => {
            body +=data;
        });

        // データ受信終了のイベント処理
        //endイベントに渡す引数はない。もう全てのデータが渡されたあとなので
        request.on('end',() => {
            data = qs.parse(body);
            //★クッキーの保存
            setCookie('msg',data.msg, response);
            write_index(request, response);
        });
    } else {
        write_index(request, response);
    }
}

// indexのページ作成
function write_index(request, response) {
    var msg = "※伝言を表示します。"
    var cookie_data = getCookie('msg', request);
    var content = ejs.render(index_page, {
        title:"Index",
        content:msg,
        data:data,
        cookie_data:cookie_data,
    });
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(content);
    response.end();
}

// クッキーの値を設定
//Q: なぜresponse? クッキーはヘッダー情報として送信するので、responseのSetheaderを利用する
function setCookie(key, value, response) {
    //値をクッキーに保存できる形式に変換する。今回は、キーは特にescapeせず
    var cookie = escape(value);
    //クッキーのヘッダー情報は『Ser-Cookie』という名称で設定されるよ。
    //配列の中に、キーと値をペアで格納し続ける
    response.setHeader('Set-Cookie',[key + '=' + cookie]);
}


// クッキーの値を取得

function getCookie(key, request) {
    var cookie_data = request.headers.cookie != undefined ? 
        request.headers.cookie : '';
        //指定のキーに該当する値を取り出す必要がある。ので、まず配列をバラす。
        //↓セミコロンで分割された配列が完成！[1=a; 2=b; c=3;....]
    var data = cookie_data.split(';');
    for(var i in data){
        //data[i]んおテキストをトリム(前後の余白を取り除く)し、key+'='というテキストで始まっているかチェックする。
        //これで始まっているなら、それが指定のキーの値だとわかる
        if (data[i].trim().startsWith(key + '=')){
            //subscribe: 'key='のあとのテキスト部分を取りだす
             var result = data[i].trim().substring(key.length + 1);
             //unescape: クッキーの値から普通のテキストに戻す
             return unescape(result);
        }
    }
    return '';
}



// ★otherのアクセス処理
var data2 = {
    'Taro':['taro@yamada', '09-999-999', 'Tokyo'],
    'Hanako':['hanako@flower', '080-888-888', 'Yokohama'],
    'Sachiko':['sachi@happy', '070-777-777', 'Nagoya'],
    'Ichiro':['ichi@baseball', '060-666-666', 'USA'],
}

// otherのアクセス処理
function response_other(request, response){
var msg = "これはOtherページです。"
    var content = ejs.render(other_page, {
        title:"Other",
        content:msg,
        data:data2,
        filename:'data_item'
    });
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(content);
}

