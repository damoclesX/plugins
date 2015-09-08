/*
    html元素值的获取和设置
    new Dataset() 初始化
        @selector string 选择器,只操作这个元素下面的元素 不依赖jquery,使用document.querySelector
        @attr string 属性名 默认为html元素的data-field属性值
*/
define(function(){
    //定义构造函数
    function DataSet(selector,attr){
        if(document.querySelectorAll){
            this.el = document.querySelector(selector)
            this.attr = attr || 'data-field';
        }
    }
    //获取html元素的值
    DataSet.prototype.get = function(string){
        //获取单个值
        if(typeof string == 'string'){
            var el = this.el.querySelector('['+this.attr+'="'+string+'"]');
            return get_value(el);
        //获取所有值
        }else{
            var res = {};
            var _this = this;
            [].slice.call(this.el.querySelectorAll('['+this.attr+']')).forEach(function(e,i){
                res[e.getAttribute(_this.attr)] = get_value(e);
            })
           return res;
        }
    }
    //设置html元素的值
    DataSet.prototype.set = function(key,value){
        //设置单个值
        if(arguments.length == 2){
            set_value(this.el.querySelector('['+this.attr+'="'+key+'"]'),value||'');
        //设置多个值
        }else{
            var _this = this;
            [].slice.call(this.el.querySelectorAll('['+this.attr+']')).forEach(function(e,i){
                set_value(e,key[e.getAttribute(_this.attr)] || '')
            })
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