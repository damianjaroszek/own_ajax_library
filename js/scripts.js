/*

AJAX({
    type: "POST",
    url: "odbierz.php",
    data: {
        firstName: "Piotr",
        lastName: "Kowalski"
    },
    headers: {
        "X-My-Header": "123#asdf"
    },
    success: function(response, xhr) {
        console.log("Udało się! Status: " + xhr.status);
    },
    failure: function(xhr) {
        console.log("Wystąpił błąd. Status: " + xhr.status);
    }
});

 */

function AJAX(config) { // jeżeli zostanie utworzona instancja obiektu bez użycia "new"

    if( !(this instanceof AJAX ) ) {  // dodaj "new" za użytkownika, zostaje przekazany config jako parametr funkcji
        return new AJAX(config); 
    }

    this._xhr = new XMLHttpRequest(); //uruchom zapytanie
    this._config = this._extendOptions(config); //przekaż config do _extendOptions, która jest utworzona na prototypie

    //console.log(this._config); // weryfikacja co zwraca defaultConfig po operacjach nadpisania

    this._assignEvents(); //przypisz zdarzenie

    this._open(); //otwórz rządanie AJAX
    this._assignUserHeaders(); //przypisz nagłówki jeżeli te poda user w config

    this._send(); //wyślij AJAX

}

AJAX.prototype._extendOptions = function(config) {

    var defaultConfig = JSON.parse(JSON.stringify(this._defaultConfig)); //zamiana obiektu na string, następnie ponownie zamiana string na obiekt 
    //(możliwe tylko w przypadku gdy w config nie ma funkcji, bo tych się nie da serializować)
    //dzięki temu mamy nowy obiekt, już nie podmieniamy wartości na prototypie
    //stąd odwołujemy się do defaultConfig a nie _defaultConfig z prototypu

    for(var key in defaultConfig) {  // iteruj po domyślnej konfiguracji odwołując się do klucza (type:, url: ... itd)

        if(key in config) {  // jeżeli klucz z defaultConfig inaczej if(config[key]) - jeżeli w config jest type: to zrób nadpisanie w defaultConfig
            defaultConfig[key] = config[key];
        }

    }

     /*

      for(var "type:" in defaultConfig){
        if("type:" in config){         
            defaultConfig["type:"] = config["type:"]; // więc jak mielismy w defaultConfig[type:"GET"]=config[type:"POST"] wiec przy użyciu samego klucza nadpisujemy też wartość
                                                                  wtedy w  w defaultConfig[type:"POST"]
        }
    }

    */

    return defaultConfig; // funkcja zwraca defaultConfig po nadpisaniach a to wszystko znajduje się w this._config bo parę linijek 
    //wyżej mamy this._config = this._extendOptions(config);

};

AJAX.prototype._assignEvents = function() { //przypisanie zdarzenia

    this._xhr.addEventListener("readystatechange", this._handleResponse.bind(this), false); //gdy "radystatechange" wykonaj _handleResponse, bind jest konieczne 
    //ponieważ w np w _handleError nie moglibyśmy się odwołać do this._xhr 
    // this._handleResponse kierowałby na _xhr 
    /*
function AJAX(config){         
if( !(this instanceof AJAX)){  
return new AJAX(config);
}

this._xhr = new XMLHttpRequest();  // <---------------------------- tutaj kierowałby this._handleResponse a my chcemy żeby this kierował do AJAX.prototype._handleResponse = function(e){}; stąd użycie BIND -> this._handleResponse.bind(this)
this._config = this._extendOptions(config); 

//console.log(this._config);

this._assignEvents(); 
}
    */
    this._xhr.addEventListener("abort", this._handleError.bind(this), false);
    this._xhr.addEventListener("error", this._handleError.bind(this), false);
    this._xhr.addEventListener("timeout", this._handleError.bind(this), false);

};

AJAX.prototype._assignUserHeaders = function() { //funkcja przypisująca nagłówki podane przez użytkownika w config
    //console.log((Object.keys(this._config.headers))); //Object.keys jeżeli w parametrze podamy mu jakiś obiekt(_config) i odwołamy się do pola (headers) zwróci nam tablicę
                                                      // ['X-My-Header'] a tablica posiada funkcję length więc jeżeli length będzie różne od 0:

    if(Object.keys(this._config.headers).length) {

        for(var key in this._config.headers) { //przeiteruj _config.headers
            this._xhr.setRequestHeader(key, this._config.headers[key]); //ustaw nagłówek przypisując do niego wartość z _config.headers
        }

    }

};

AJAX.prototype._open = function() {

    this._xhr.open( //otwieramy połączenie
        this._config.type, //"POST"
        this._config.url, // "odbierz.php"
        this._config.options.async, //"true"
        this._config.options.username, //"null"
        this._config.options.password // "null"
    );

    this._xhr.timeout = this._config.options.timeout; //timeout ustawiamy bezpośrednio na obiekcie xhr

};

AJAX.prototype._send = function() { //funkcja wykona się gdy serwer odpowie

    this._xhr.send();

};

AJAX.prototype._handleResponse = function(e) { //funkcja wykona się gdy serwer odpowie

    if(this._xhr.readyState === 4 && this._xhr.status === 200) { //this kieruje bezpośrednio na obiekt a nie na konstruktor?
        console.log("Otrzymano odpowiedź");
    }

};




AJAX.prototype._handleError = function(e) { 



};

// każde kolejne wywołanie obiektu AJAX z nową konfiguracją będzie nadpisywało bieżącą konfigurację, wiec jak domyslnie było GET, to po nadpisaniu gdzie był
// w config type: "POST" okaże, się że domyślnie chcemy POST a nie jak wcześniej zakładaliśmy GET
// to temu zaradzi var defaultConfig = JSON.parse(JSON.stringify(this._defaultConfig))

AJAX.prototype._defaultConfig = { // jeżeli w config nie będziemy mieli podengo przez użytkownika jakiegoś pola, to podstawimy pole zdefiniowane domyślnie
    type: "GET",
    url: window.location.href,
    data: {},
    options: {
        async: true,
        timeout: 0, //--------->> jeżeli ktoś będzie chciał nadpisać domyślne opcje - przykładowo timeout podaje to tutaj [patrz komentarz options]
        username: null,
        password: null
    },
    headers: {}
 };

AJAX({ // zapisanie var a oznacza, że _xhr jest pod tym zapisane, gdyby nie było ubrane to w zmienną kod by się wykonał i zniknął
    type: "POST",
    url: "odbierz.php",
    data: {
        firstName: "Piotr",
        lastName: "Kowalski"
    },

        // options:{
    //     timeout: 10 //--------->> jeżeli ktoś będzie chciał nadpisać domyślne opcje - przykładowo timeout podaje to tutaj
    // },
    
    headers: {
        "X-My-Header": "123#asdf"
    },
    success: function(response, xhr) {
        console.log("Udało się! Status: " + xhr.status);
    },
    failure: function(xhr) {
        console.log("Wystąpił błąd. Status: " + xhr.status);
    }
});