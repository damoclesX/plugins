define(function(){
    var jsonpcallbackuid = 0;
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
            xhr.open(param.type, param.url, true);
            if(param.type == 'POST'){
                xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                param.data = obj2url(param.data)
            }else if(param.type == 'GET'){
                param.url += obj2url(param.data)
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
        jsonp: function(param){
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
        },
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
        })(window)
    };
    return utils;
})
