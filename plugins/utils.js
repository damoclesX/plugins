define(function(){
    var utils = {
        ajax: function (param){
            param = param || {};
            param.type = (param.type || 'GET').toUpperCase();
            param.data = param.data || {};
            var xhr = null
            if(window.XMLHttpRequest){
                xhr = new XMLHttpRequest;
            }else{
                xhr = new ActiveXObject("Microsoft.XMLHTTP")
            }
            
            if(param.type == 'POST'){
                xhr.open(param.type, param.url, true);
                xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                param.data = obj2url(param.data)
            }else if(param.type == 'GET'){
                param.url += '?'+obj2url(param.data)
                xhr.open(param.type, param.url, true);
                param.data = null
            }

            xhr.onreadystatechange = function(){
                if(xhr.readyState == 4 && xhr.status == 200){
                    if(/^\{(?:.*)\}$/.test(xhr.responseText)){
                        param.success && param.success.call(xhr, JSON.parse(xhr.responseText))
                    }else{
                        param.success && param.success.call(xhr, xhr.responseText)
                    }
                }
            };
            xhr.send(param.data);
            function obj2url(obj){
                var res = [];
                for(var i in obj){
                    res.push(i+'='+obj[i]);
                }
                return res.join('&');
            }
        },
        jsonp: (function(){
            var jsonpcallbackuid = 0;
            return function(param){
                param = param || {};
                if(!param.url) return;
                var data = param.data || {};
                var hasData = !!Object.keys(data).length;
                param.handle = typeof param.success == 'function' ? param.success : function(){};
                param.error = typeof param.error == 'function' ? param.error : function(){};
                var id = _createTmp(param.handle);
                _createScript(param.url, data, id, param.error, param.handle);
                function _createScript(url, data, tmp, errorHandle){
                    var oScript = document.createElement('script');
                    oScript.type = 'text/javascript';
                    data.jsoncallback = id;
                    oScript.src = url +'?'+ obj2url(data);
                    document.head.appendChild(oScript);

                    oScript.onload = function(){
                        delete window[id];
                    };
                    oScript.onerror = function(ev){
                        errorHandle && errorHandle(ev);
                    };
                    return oScript;
                }
                function obj2url(obj){
                    var res = [];
                    for(var i in obj){
                        res.push(i+'='+obj[i]);
                    }
                    return res.join('&');
                }
                function _createTmp(handle){
                    var id = 'jsonpcallback'+(++jsonpcallbackuid);
                    win[id] = function(res){
                        if(/^\{(?:.*)\}$/.test(res)){
                            handle && handle(JSON.parse(res))
                        }else{
                            handle && handle(res)
                        }
                    };
                    return id;;
                }
            }
        })(),
        cache: (function(win){
            function Version(){

            };
            Version.prototype.date = function(day, gmt){
                var date = new Date();
                day = typeof day == 'number' ? day : 0;
                if(gmt){
                    day++;
                };
                date.setDate(date.getDate()+day);
                date.setHours(0, 0, 0, 0);

                if(!gmt){
                    return date.getFullYear()+_zerolize(date.getMonth()+1)+_zerolize(date.getDate());
                }else{
                    return date.toGMTString()
                }
            };
            Version.prototype.hour = function(hour, gmt) {
                var date = new Date();
                hour = typeof hour == 'number' ? hour : 0;
                date.setDate(date.getHours()+hour);

                if(!gmt){
                    return date.getFullYear()+_zerolize(date.getMonth()+1)+_zerolize(date.getDate())+_zerolize(date.getHours);
                }else{
                    return date.toGMTString()
                }
            };
            function _zerolize(n){
                return n<10 ? '0'+n : ''+n;
            }

            function Cache(param){
                param = param || {};
                this.version = new Version;
                //默认不写入cookie
                this.cookie = typeof param.cookie == 'boolean' ? param.cookie : 
                                     false && win.localStorage ? false : true;
            }
            Cache.prototype.addCache = function(key, value, noVersion){
                var data;
                var tmp;
                if(typeof value == 'string'){
                    data = value;
                }else{
                    data = JSON.stringify(value)
                };
                if(!noVersion){
                    this.handleVersion(key)
                    key+= this.version.date()
                }
                //
                if(this.cookie){
                    this.addCookie(key, data);
                }else{
                    localStorage[key] = data;
                }
            };
            Cache.prototype.handleVersion = function(key){
                var versions = this.getCache(key+'Versions', false);
                if(versions){
                    versions = JSON.parse(versions)
                }else{
                    versions = [];
                }
                if(versions.indexOf(key+this.version.date()) == -1){
                    versions.push(key+this.version.date());
                    this.addCache(key+'Versions', versions, true)
                }
            };
            Cache.prototype.getCache = function(key, now){
                now = typeof now == 'boolean' ? now : true;
                if(now) key+= this.version.date();
                if(this.cookie){
                    return this.getCookie(key)
                }else{
                    return localStorage[key] || '';
                }
            };
            Cache.prototype.removeCache = function(key){
                var versions = this.getCache(key+'Versions', false);
                if(versions){
                    versions = JSON.parse(versions);
                    if(Array.isArray(versions) && versions.length){
                        if(!this.cookie){
                            versions.forEach(function(e, array){
                                if(e+this.version.date() != e){
                                    win.localStorage.removeItem(e)
                                }
                            }.bind(this))
                        }else{
                            versions.forEach(function(e){
                                this.removeCookie(e)
                            }.bind(this))
                        }
                    }
                }
            };
            Cache.prototype.clearCache = function(){

            };
            Cache.prototype.addCookie = function(key, value, day){
                day = typeof day == 'number' ? day : 0;
                document.cookie = key + '=' + encodeURIComponent(value) + ';expires='+(this.version.date(day, true));
            };
            Cache.prototype.getCookie = function(key){
                if(document.cookie.length){
                    var match = document.cookie.match(new RegExp(key+'=([^;]+)'));
                    if(match && match[1]){
                        return decodeURIComponent(match[1]);
                    }
                    return '';
                }
                return '';
            };
            Cache.prototype.removeCookie = function(key){
                this.addCookie(key, '', -1)
            };
            return new Cache;
        })(window),
        deviceready: function(callback, options){
            if(window.tinmanBridge){
                return callback.call(window.tinmanBridge, window.tinmanBridge);
            }
            options = options || {};
            var emptyFn = function(){};
            var bridge = {
                origin: null,
                native: true,
                on: emptyFn,
                trigger: emptyFn,
                init: emptyFn,
                call: emptyFn,
                platform: 'pc',
                androidFn: {},
                placeholder: null,
                info: function(){
                    var args = Array.prototype.slice.call(arguments);
                    var tpl = args.map(function(e){
                        if(e == null) return '';
                        switch(typeof e){
                            case 'number':
                            case 'string':
                            case 'boolean':
                                return ''+e;
                            case 'function':
                                return ''+e.toString();
                            case 'object':
                                if(Array.isArray(e)){
                                    return e.join(',')
                                }else{
                                    return JSON.stringify(e);
                                }
                            default:
                                return e.toString
                        }
                    }).join('---');
                    console.log(tpl);
                    if(bridge.placeholder){
                        bridge.placeholder.innerHTML = tpl;
                    }else{
                        var id = 'bridge'+Math.random().toString().substring(2);

                        var tmp = document.createElement('div');
                        tmp.style.cssText = 'text-align:center;color:#ff2424;background-color:#fff;';
                        tmp.id = id;
                        tmp.innerHTML = tpl;
                        document.body.insertBefore(tmp, document.body.children[0]);
                        bridge.placeholder = tmp;
                    }
                },
                debug: typeof options.debug == 'boolean' ? options.debug : false,
                output: options.output || {
                    trigger: false,
                    call: false,
                    on: false,
                    init: false
                }
            };
            //ios
            if(window.WebViewJavascriptBridge){
                _handleIOS(window.WebViewJavascriptBridge, callback)
            //android
            }else if(window.TinmanBridgeAndroid){
                _handleANDRIOD(window.TinmanBridgeAndroid, callback)
            }else{
                //ios
                document.addEventListener('WebViewJavascriptBridgeReady',function(){
                    _handleIOS(window.WebViewJavascriptBridge, callback)
                },false);
                //pc
                if(bridge.debug){
                    document.addEventListener('DOMContentLoaded',function(){
                        _handlePC(bridge, callback)
                    },false);
                }
            }
            function _handleIOS(_bridge, callback){
                bridge.origin = _bridge;
                bridge.platform = 'ios';
                bridge.init = function(handler){
                    if(bridge.debug && bridge.output.init){
                        bridge.info('init: ');
                    }
                    bridge.origin.init(handler)
                };
                bridge.on = function(name, handler){
                    if(bridge.debug && bridge.output.on){
                        bridge.info('on: '+name+'\n'+handler);
                    }
                    bridge.origin.registerHandler(name, handler);
                };
                bridge.trigger = function(name, data, callback){
                    if(bridge.debug && bridge.output.trigger){
                        bridge.info('on: '+name+'\n'+data);
                    }
                    if(data){
                        data = typeof data == 'string' ? data : JSON.stringify(data)
                    }
                    bridge.origin.callHandler(name, data, callback);
                };
                callback.call(bridge, bridge)
            }
            function _handleANDRIOD(_bridge, callback){
                bridge.origin = _bridge;
                bridge.platform = 'android';
                bridge.androidFn = {};
                bridge.call = function(name, data){
                    if(bridge.debug && bridge.output.call){
                        bridge.info(name, data)
                    }
                    if(name in bridge.androidFn){
                        bridge.androidFn[name].forEach(function(e){
                            if(typeof e == 'function') e(data);
                        })
                    }
                };
                bridge.on = function(name, handler){
                    if(bridge.debug && bridge.output.on){
                        bridge.info(name, handler)
                    }
                    if(!(name in bridge.androidFn)){
                        bridge.androidFn[name] = [];
                    }
                    bridge.androidFn[name].push(handler);
                };
                bridge.trigger = function(name, data){
                    if(bridge.debug && bridge.output.trigger){
                        bridge.info(name, data)
                    }
                    if(data != null){
                        data = typeof data == 'string' ? data : JSON.stringify(data);
                        bridge.origin[name] && bridge.origin[name](data)
                    }else{
                        bridge.origin[name] && bridge.origin[name]()
                    };
                };
                callback.call(bridge, bridge);
            }
            function _handlePC(){
                bridge.native = false;
                bridge.debugFn = {};
                bridge.trigger = function(name, data){
                    if(bridge.debug && bridge.output.trigger){
                        bridge.info(name, data)
                    }
                };
                bridge.on = function(name, handler){
                    if(!(name in bridge.debugFn)){
                        bridge.debugFn[name] = [];
                    }
                    bridge.debugFn[name].push(handler);
                };
                bridge.call = function(name, data){
                    if(name in bridge.debugFn){
                        bridge.debugFn[name].forEach(function(e){
                            if(typeof e == 'function') e(data);
                        })
                    }
                };
                callback.call(bridge, bridge);
            }
            window.tinmanBridge = bridge;
        }
    };
    return utils;
})
