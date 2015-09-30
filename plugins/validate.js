/*
    验证数据有效性
    new Dataset() 初始化
        @option 验证选项
            data: required object 验证的数据对象
            alias: required object 数据中文映射
                {
                    username:'用户名'
                }
            notEmpty:  object  验证非空
                {
                    fields:['username','password'],//数据字段名
                    info:'{field}不能为空' //提示信息 {field}验证的中文映射
                }
            lenLim:  object 验证长度
                {
                    fields:['username'],//数据字段名
                    info:'{field}在{min}-{max}之间', //提示信息 {min}{max}分别为字符长度
                    min: 5 , //默认为0 
                    max: 10  //默认为1000
                }
                或者
                {
                    fields:[{
                        fields:['username'],
                        min:10,
                        max:100
                    },'password'],
                    info:'{field}在{min}-{max}之间'
                    min:5,
                    max:10
                }
            pattern: array 验证模式
                [
                    {
                        fileds:['email'],
                        type:'email', //使用内置正则验证 优先内置
                        info:'请输入{field}的正确格式'
                    },
                    {
                        fields:['phone'],
                        reg:/^0?(13|14|15|17|18)[0-9]{9}$/, //自定义正则
                        info:'请输入{field}的正确格式' 
                    }
                ]
            individuation: array 自定义验证
                [
                    {
                        fields:['password','rpassword'],
                        info:'两次密码输入不一致',
                        handle:function(password,rpassword){ //自定义处理函数 参数顺序与fields字段一致,返回假值验证失败，返回真值验证成功
                            return password == rpassword;
                        }
                    }
                ]
        
        return object 验证结果
            {
                valid: boolean true || false 是否验证成功,
                msg : string 验证是否的提示信息
                field: string || array 验证失败的字段 自定义验证时可能会返回array
            }

*/
define(function(){
    //内置验证模式
    var baseReg = {
        phone:/^0?(13|14|15|17|18)[0-9]{9}$/,
        email:/^\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/
    }
    function Validate(option){
        this.res = {
            valid:false
        };
        this.option = option;
        //如果有非空限制
        if(option.notEmpty && option.notEmpty.fields && option.notEmpty.fields.length){
            this.res.valid = this.notempty(option);
            //验证非空失败
            if(!this.res.valid){
                return this.res;
            }
        }
        //如果有长度限制
        if(option.lenLim){
            this.res.valid = this.lengthLimit(option);
            //验证长度限制失败
            if(!this.res.valid){
                return this.res;
            }
        }
        //如果有正则限制
        if(option.pattern && option.pattern.length){
            this.res.valid = this.pattern(option);
            //规则验证失败
            if(!this.res.valid){
                return this.res;
            }
        }
        if(option.individuation && option.individuation.length){
            this.res.valid = this.individuation(option);
            //规则验证失败
            if(!this.res.valid){
                return this.res;
            }
        }
        return this.res;
    }
    Validate.prototype.notempty = function(option){
        var notempty = option.notEmpty;

        var info = notempty.info || '请输入{field}';

        for(var i=0;i<notempty.fields.length;i++){
            var tmp = notempty.fields[i];
            if(tmp in option.data){
                if(/^\s*?$/.test(option.data[tmp])){
                    this.res.msg = info.replace('{field}',option.alias[tmp] || tmp);
                    this.res.field = tmp;
                    return false;
                }
            }
        }
        return true;
    };
    Validate.prototype.lengthLimit = function(option){
        var lenLim = option.lenLim;
        var info = lenLim.info || '{field}长度在{min}-{max}位字符之间';
        var min = lenLim.min || 0;
        var max = lenLim.max || 1000;
        for(var i=0;i<lenLim.fields.length;i++){
            var tmp = lenLim.fields[i];
            if(typeof tmp === 'string'){
                if(tmp in option.data){
                    //所有字段共用一套长度限制规则
                    //过滤空格
                    var val = option.data[tmp].replace(/^\s+|\s+$/,'');
                    if(val.length>max || val.length<min){
                        this.res.msg = info.replace('{field}',option.alias[tmp]).replace('{min}',min).replace('{max}',max
                            );
                        this.res.field = tmp;
                        return false;
                    }
                }
            }else{
                //一个或几个字段共用一套长度限制规则
                var min = tmp.min || min;
                var max = tmp.max || max;
                for(var j=0;j<tmp.fields.length;j++){
                    var t = tmp.fields[j];
                    if(t in option.data){
                        var val = option.data[t].replace(/^\s+|\s+$/,'');
                        if(val.length>max || val.length<min){
                            this.res.msg = info.replace('{field}',option.alias[t]).replace('{min}',min).replace('{max}',max
                                );
                            this.res.field = t;
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    };
    Validate.prototype.pattern = function(option){
        var pattern = option.pattern;
        for(var i=0;i<pattern.length;i++){
            var tmp = pattern[i];
            var info = tmp.info || '{field}格式不正确';
            var type = tmp.type || '';
            var reg = (type && baseReg[type]) || tmp.reg;
            for(var j=0;j<tmp.fields.length;j++){
                var t = tmp.fields[j];
                if(t in option.data){
                    if(!reg.test(option.data[t])){
                        this.res.msg = info.replace('{field}',option.alias[t]);
                        this.res.field = t;
                        return false;
                    }
                }
            }
        }
        return true;
    };
    Validate.prototype.individuation = function(option){
        var individuation = option.individuation;
        for(var i=0;i<individuation.length;i++){
            var tmp = individuation[i];
            var data = [];
            for(var j=0;j<tmp.fields.length;j++){
                if(tmp.fields[j] in option.data){
                    data.push(option.data[tmp.fields[j]])
                }else{
                    this.res.fields = tmp.fields[j];
                    this.res.msg = '未找到改字段';
                    return true;
                }
            }
            if(!tmp.handle.apply(option,data)){
                this.res.field = tmp.fields;
                this.res.msg = tmp.info || '验证失败';
                return false;
            }
        }
        return true;
    };
    return Validate;
})