define(function(){
    function DataSet(selector){
        if(document.querySelectorAll){
            this.el = document.querySelector(selector)
        }
    }
    DataSet.prototype.get = function(string){
        if(typeof string == 'string'){
            var el = this.el.querySelector('[data-field="'+string+'"]');
            return get_value(el);
        }else{
            var res = {};
            [].slice.call(this.el.querySelectorAll('[data-field]')).forEach(function(e,i){
                res[e.getAttribute('data-field')] = get_value(e);
            })
           return res;
        }
    }
    DataSet.prototype.set = function(key,value){
        if(arguments.length == 2){
            set_value(this.el.querySelector('[data-field="'+key+'"]'),value||'');
        }else{
            [].slice.call(this.el.querySelectorAll('[data-field]')).forEach(function(e,i){
                set_value(e,key[e.getAttribute('data-field')] || '')
            })
        }
    }
    //获取值
    function get_value(ele){
        var tagName = ele.tagName.toLowerCase();
        var value = '';
        switch(tagName){
            case 'textarea':
            case 'select':
            case 'input':
                value = ele.value;
                break;
            case 'img':
                value = ele.getAttribute('src');
                break;
            default:
                value = ele.innerHTML;
        }
        return value;
    }
    //设置值
    function set_value(ele,value){
        var tagName = ele.tagName.toLowerCase();
        switch(tagName){
            case 'select':
            case 'textarea':
            case 'input':
                ele.value = value;
                break;
            case 'img':
                ele.src = value;
                break;
            default:
                ele.innerHTML = value;
        }
    }
    return DataSet;
})