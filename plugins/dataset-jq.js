define(['jQuery'],function($){
    function DataSet(selector){
        this.$el = $(selector);
        this.$fields = this.$el.find('[data-field]');
        this.fields = {};
        var _this  = this;
        this.$fields.each(function(i,e){
            _this.fields[e.dataset.field] = $(e);
        })
    }
    DataSet.prototype.get = function(string){
        if(typeof string == 'string'){
            var $el = this.fields[string];
            return _value($el);
        }else{
            var res = {};
           this.$fields.each(function(i,e){
                res[e.dataset.field] = _value($(e));
           })
           return res;
        }
    }
    DataSet.prototype.set = function(key,value){
        if(arguments.length == 2){
            $value(this.fields[key],value||'');
        }else{
            this.$fields.each(function(i,e){
                key[e.dataset.field] && $value($(e),key[e.dataset.field] || '')
            })
        }
    }
    DataSet.prototype.clear = function(except){
        var bExcept = !!except;
        this.$fields.each(function(i,e){
            if(bExcept){
                var fieldName =  e.dataset.field;
                if(typeof except == 'string'){
                    if(except != fieldName){
                        $value($(e),'')
                    }
                }else if(Array.isArray(except)){
                    if(except.indexOf(fieldName) == -1){
                        $value($(e),'')
                    }
                }
            }else{
                $value($(e),'')
            }
        })
    }
    DataSet.prototype.el = function(field){
        if(typeof field == 'string'){
            return this.fields[field];
        }
    }
    //获取值
    function _value($el){
        var tagName = $el[0].tagName.toLowerCase();
        var value = '';
        switch(tagName){
            case 'textarea':
            case 'select':
            case 'input':
                value = $el.val();
                break;
            case 'img':
                value = $el.attr('src');
                break;
            default:
                value = $el.text();
        }
        return value;
    }
    //设置值
    function $value($el,value){
        var tagName = $el[0].tagName.toLowerCase();
        switch(tagName){
            case 'select':
            case 'textarea':
            case 'input':
                $el.val(value);
                break;
            case 'img':
                $el.attr('src',value);
                break;
            default:
                $el.text(value);
        }
    }
    return DataSet;
})