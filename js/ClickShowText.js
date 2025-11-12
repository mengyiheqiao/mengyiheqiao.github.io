var a_idx = 0;
jQuery(document).ready(function($) {
    $("body").click(function(e) {
        var a = ["爱你", "汪汪", "喵喵", "你好呀", "欢迎光临", "ヾ(≧∇≦*)ゝ"];
        var $i = $("<span/>").text(a[a_idx]);
        a_idx = (a_idx + 1) % a.length;
        var x = e.pageX, y = e.pageY;
        $i.css({
            "z-index": 5,
            "top": y - 20,
            "left": x,
            "position": "absolute",
            "font-weight": "bold",
            "color": "#FF0000",
            "font-size": "20px",
            "pointer-events": "none",
            "user-select": "none"
        });
        $("body").append($i);
        $i.animate({
            "top": y - 180,
            "opacity": 0
        }, 3000, function() {
            $i.remove();
        });
    });
});