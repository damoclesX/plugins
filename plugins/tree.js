/*
    树
    new Tree() 初始化
        @el required   string 数插入的元素
        @data required array 树的数据
        @defaultLevel  number 数开始的等级数值 默认为0
        @children      string  树的子节点属性名 默认为children
        @parentNode    object  父节点配置
                        {
                            //自定义属性
                            props: {
                                'data-level' : '{level}' //'{level}'为内部level变量,
                                //可事件绑定——建议外部独立绑定事件
                                onclick:    function(){
                                    
                                }
                            }
                            //父级节点className的映射
                            classMaps: {
                                1: 'parent-one',
                                2: 'parent-two',
                                3: 'parent-three'
                            },
                            //最高级自定义函数-参数包含level变量
                            supper: function(level) {
                                //期待返回一个ul元素
                            }
                        }
        @childNode     object 子节点配置
                        {
                            //除父节点属性外
                            //子节点模板-模板内容填充在li标签内,可使用{}包含属性名方式填充数据
                            tpl: '<span data-level="{level}">{name}</span>',
                            //single为这个子节点数据，level为当前等级
                            supper: function(single, level) {
                                //期待返回一个li元素
                            }
                        }

*/
define(function(){
    var tree = function(params){
        return new Tree(params);
    };
    function Tree(params){
        params = params || {};
        this.data = params.data;
        this.defaultLevel = typeof params.defaultLevel == 'number' ? params.defaultLevel : 0;
        this.children = typeof params.children == 'string' ? params.children : 'children';
        this.el = params.el;
        this.parentNode = params.parentNode;
        this.childNode = params.childNode;
        this.params = params;
        this.init();
    };
    Tree.prototype.init = function(arguments) {
        //创建最外层ul
        var oUl  = document.createElement('ul');
        oUl.classList.add(this.params.className);
        //遍历创建一级树
        this.data.forEach(function(e) {
            this.createTree(e, this.defaultLevel, oUl)
        }.bind(this));

        document.querySelector(this.el) && (document.querySelector(this.el).appendChild(oUl));
        oUl = null;
    };
    //创建树
    Tree.prototype.createTree = function(single,level,parent) {
        var tmp = this.createNode(single,level);
        parent.appendChild(tmp);

        //存在子节点
        if(single[this.children] && single[this.children].length){
            level++;
            var subparent = this.createParentNode(level);
            tmp.appendChild(subparent);
            single.children.forEach(function(e) {
                this.createTree(e,level,subparent)
            }.bind(this))
        }
    };
    //创建子节点
    Tree.prototype.createNode = function(single,level) {
        var childNode = this.childNode;
        
        if(childNode && typeof childNode.supper == 'function'){
            return childNode.supper.call(this, single, level);
        }
        var oLi = document.createElement('li');
        //有自定义配置
        if(childNode){
            //添加外部自定义属性
            if(childNode.props){
                for( var i in childNode.props){
                    //字符串可使用内部变量level
                    if(typeof childNode.props[i] == 'string'){
                        oLi[i] = childNode.props[i].replace('{level}', level)
                    //可绑定函数
                    }else{
                        oLi[i] = childNode.props[i]
                    }
                }
            }
            if(childNode.classMaps){
                //使用className映射
                if(childNode.classMaps && Object.keys(childNode.classMaps).length){
                    var keys = Object.keys(childNode.classMaps);
                    //没有映射的使用最后一个
                    var className = childNode.classMaps[level] || childNode.classMaps[keys[keys.length-1]];

                    oLi.className = className;
                }else{
                    oLi.className = 'level-child-'+level;
                }
            }else{
                oLi.className = 'level-child-'+level;
            }
        }else{
            oLi.className = 'level-child-'+level;
        }

        if(childNode && childNode.tpl){
            var fields = childNode.tpl.match(/\{(\w+)\}/g);
            var res = childNode.tpl;
            fields.forEach(function (e){
                var m = e.match(/\{(\w+)\}/)[1];

                res = res.replace(e, single[m] || level)
            })
            oLi.innerHTML = res;
        }else{
            oLi.innerHTML = '<span>'+JSON.stringify(single)+'</span>'
        }

        return oLi;
    };
    //创建父级节点
    Tree.prototype.createParentNode = function(level) {
        var parentNode = this.parentNode;

        if(parentNode && typeof parentNode.supper == 'function'){
            return parentNode.supper.call(this, level)
        }
        var oUl = document.createElement('ul');
        //有自定义配置
        if(parentNode){
            //添加外部自定义属性
            if(parentNode.props){
                for( var i in parentNode.props){
                    //字符串可使用内部变量level
                    if(typeof parentNode.props[i] == 'string'){
                        oUl[i] = parentNode.props[i].replace('{level}', level)
                    //可绑定函数
                    }else{
                        oUl[i] = parentNode.props[i]
                    }
                }
            }
            if(parentNode.classMaps){
                //使用className映射
                if(parentNode.classMaps && Object.keys(parentNode.classMaps).length){
                    var keys = Object.keys(parentNode.classMaps);
                    //没有映射的使用最后一个
                    var className = parentNode.classMaps[level] || parentNode.classMaps[keys[keys.length-1]];

                    oUl.className = className;
                }else{
                    oUl.className = 'level-parent-'+level;
                }
            }
        }else{
            oUl.className = 'level-parent-'+level;
        }
        return oUl;
    };
    return tree;
})
