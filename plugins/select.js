/*
    扩展下拉选择框，双击下拉选择框可新增选项
    new Select() 初始化
        @eles 选择器,为select元素
        @options 选项,
            type 输入框类型 || 'text'
            className 输入框类名 || 'form-control'
    兼容IE9+浏览器
*/
define(function(){
    function Select(eles,option){
        //默认选择
        option = option || {
            type:'text',
            className:'form-control'
        };
        //获取元素
        var eles = document.querySelectorAll(eles);

        //遍历获取的元素
        [].slice.call(eles).map(function(ele){

            //只处理select元素
            if(ele.tagName.toLowerCase() != 'select'){
                return false;
            }
            //绑定双击事件
            ele.addEventListener('dblclick', function(e) {
                var _this = this;
                //获取select的原始值
                var options = [].slice.call(this.options).map(function(o){
                    return o.value;
                });
                
                //创建输入框
                var oInput = document.createElement('input');
                oInput.className = option.className;
                oInput.type = option.type;

                //绑定输入框事件
                oInput.addEventListener('blur', function(e) {
                    var value = this.value.trim();
                    //输入值不为空 && 输入的值select之前没有
                    if(value && options.indexOf(value) == -1){
                        //增加选项
                        var option = new Option;
                        option.value = value;
                        option.text = '自定义选项'+value;
                        _this.add(option);
                        _this.value = value;
                    }
                    //显示下拉选择
                    _this.style.display = 'inline-block';
                    this.parentNode.removeChild(this);
                });

                this.style.display = 'none';
                this.parentNode.appendChild(oInput);

                //自动聚焦
                // oInput.autofocus = true;
                oInput.focus();
                
            },false);
        })
    }
    return Select;
})