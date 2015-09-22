define(['jQuery'],function($){
    function DataSet(selector,attr){
        this.$el = $(selector);
        attr = attr || 'data-field';
        this.$fields = this.$el.find('['+attr+']');
        this.fields = {};
        var _this  = this;
        //缓存元素
        this.$fields.each(function(i,e){
            _this.fields[e.dataset.field] = $(e);
        })
    }
    //获取html元素的值
    DataSet.prototype.get = function(string){
        //获取单个值
        if(typeof string == 'string'){
            var $el = this.fields[string];
            return _value($el);
        //获取多个值
        }else{
            var res = {};
            this.$fields.each(function(i,e){
                res[e.dataset.field] = _value($(e));
            })
            return res;
        }
    }
    //设置html元素的值
    DataSet.prototype.set = function(key,value){
        //设置单个值
        if(arguments.length == 2){
            $value(this.fields[key],value||'');
        //设置多个值
        }else{
            this.$fields.each(function(i,e){
                key[e.dataset.field] && $value($(e),key[e.dataset.field] || '')
            })
        }
    }
    //清空html元素的值
    DataSet.prototype.clear = function(except){
        //排除不需要情况的值
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
    //根据字段名获取单个元素
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