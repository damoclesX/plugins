/*
    html元素值的获取和设置
    new Dataset() 初始化
        @selector string 选择器,只操作这个元素下面的元素 不依赖jquery,使用document.querySelector
        @attr string 属性名 默认为html元素的data-field属性值
    支持ie9+浏览器
*/
define(function(){
    //定义构造函数
    function DataSet(selector,attr){
        //低版本浏览器不兼容querySelector
        if(document.querySelectorAll){
            this.attr = attr || 'data-field';
            //获取当前元素下的所有字段,装换成数组
            this.fields = [].slice.call(document.querySelector(selector).querySelectorAll('['+this.attr+']'));
            //缓存找到的元素
            this.cache = {};
            var _this = this;
            this.fields.forEach(function(e){
                _this.cache[e.getAttribute(_this.attr)] = e;
            })
        }
    }
    //获取html元素的值
    DataSet.prototype.get = function(string){
        //获取单个值
        if(typeof string == 'string'){
            if(string in this.cache){
                return get_value(this.cache[string])
            }else{
                throw '未找到该元素';
            }
        //获取所有值
        }else{
            var res = {};
            var _this = this;
            this.fields.forEach(function(e){
                res[e.getAttribute(_this.attr)] = get_value(e);
            })
           return res;
        }
    }
    //设置html元素的值
    DataSet.prototype.set = function(key,value){
        //设置单个值
        if(arguments.length == 2 && key in this.cache){
            set_value(this.cache[key],value||'');
        //设置多个值
        }else{
            var _this = this;
            this.fields.forEach(function(e){
                set_value(e,key[e.getAttribute(_this.attr)] || '')
            })
        }
    }
    //清空html元素的值
    DataSet.prototype.clear = function(except){
        //排除不需要情况的值
        var bExcept = !!except;
        var _this  = this;
        this.fields.forEach(function(e){
            if(bExcept){
                var fieldName = e.getAttribute(_this.attr);
                if(typeof except == 'string'){
                    if(except != fieldName){
                        set_value(e,'')
                    }
                //判断数组采用ecma5的方法,低版本浏览器不兼容
                }else if(Array.isArray(except)){
                    if(except.indexOf(fieldName) == -1){
                        set_value(e,'')
                    }
                }
            }else{
                set_value(e,'')
            }
        })
    }
    //根据字段名获取单个元素
    DataSet.prototype.el = function(field){
        if(typeof field == 'string'){
            return this.cache[field];
        }
    }
    //获取html值
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
    //设置html值
    function set_value(ele,value){
        var tagName = ele.tagName.toLowerCase();
        switch(tagName){
            case 'select':
                var origin = [].slice.call(ele.options).map(function(e){
                    return e.value;
                });
                if(value.trim() != '' && origin.indexOf(value) == -1 ){
                    var option = new Option;
                    option.value = value;
                    option.text = value;

                    ele.add(option);
                    ele.value = value;
                }else{
                    ele.value = origin[0];
                };
                break;
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