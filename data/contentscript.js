var curr_ev = null
var prev_x = -5
var prev_y = -5
var fr_x = 0
var to_x = 0
var first_stop = true
var not_emitted = true
var enabled = true
var pref_apy_url = ""
var escapeChars = {
   "&": "&amp;",
   "<": "&lt;",
   ">": "&gt;",
 };
 
$("body").append("<div id = \"apertium-popup-translate\" class = \"apertium-popup-translate\"> <div id = \"apertium-popup-translate-text\" class = \"apertium-popup-translate-text\"> </div>")   

function real_movement(prex, prey, postx, posty) {
    if (Math.sqrt(Math.pow(prex-postx, 2) + Math.pow(prey-posty, 2)) >= 10) {
        return true;
    }
    return false;
}

$(document).mousemove(function(event) {
    if ((curr_ev) && (real_movement(prev_x, prev_y, event.pageX - window.pageXOffset, curr_ev.pageY - window.pageYOffset))) {
        $(".apertium-popup-translate").css("display","none")
    }
    curr_ev = event
});

function mouse_hover() {
    if (curr_ev) {

        var elem = $(document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset));
            
        var nodes = elem.contents().filter(function(){
            return this.nodeType == Node.TEXT_NODE && !($(this).text().match(/\A\s*\z/))
        });

        $(nodes).wrap('<apertiumproblocation />');

        if (nodes.length == 0) {
            $(nodes).unwrap();
        } else {            
            var text = document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset);
            if (text.nodeName == 'APERTIUMPROBLOCATION') { 
                $(nodes).unwrap();
                var txt = document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset);
                var prev_txt = document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset);
                var orig_text = $(txt).html();
                
                txt = $(txt).contents().filter(function(){
                    return this.nodeType == Node.TEXT_NODE && !($(this).text().match(/\A\s*\z/))
                });
                
                $.each(txt, function(inx, words) {
                    var wordarr = $(words).text().split(/([\s-;.])/g)
                    var dest_str = "" 
                    $.each(wordarr, function(inx, atext) {
                        dest_str = dest_str + "<apertiumword>" + htmlEscape(atext) + "</apertiumword>"
                    });
                    $(words).replaceWith(dest_str)
                    
                });
                
                
                
                $(".apertium-popup-translate-text").empty()
                
                var disp_txt = $(document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset)).text()
                
                // disp_txt = XRegExp.replace(disp_txt, new XRegExp("\\P{L}+", "g"), "")
                                
                console.log(disp_txt)
                if(disp_txt != "") {
                    $(".apertium-popup-translate-text").append(disp_txt)
                    console.log()
                    $(".apertium-popup-translate").css("display","table")
                    var y_offset = 15
                    if ((curr_ev.pageY - window.pageYOffset + 40 + $(".apertium-popup-translate-text").outerHeight()) > $(window).height()) {
                        y_offset = -40
                    }
                    
                    var x_offset = 20
                    
                    if ((curr_ev.pageX + 70 + $(".apertium-popup-translate-text").outerWidth()) > $(window).width()) {
                        x_offset = -$(".apertium-popup-translate-text").outerWidth() + 20 - 60
                    }
                    
                    if ((curr_ev.pageX + x_offset) < 0) {
                        $(".apertium-popup-translate").css("left","5px")
                    } else {
                        $(".apertium-popup-translate").css("left",((curr_ev.pageX + x_offset).toString() + "px"))
                    }
                    
                    if ((curr_ev.pageY + y_offset) < 0) {
                        $(".apertium-popup-translate").css("top","5px")
                    } else {
                        $(".apertium-popup-translate").css("top",((curr_ev.pageY + y_offset).toString() + "px"))       
                    }
                }
                
                prev_x = curr_ev.pageX - window.pageXOffset
                prev_y = curr_ev.pageY - window.pageYOffset
                
                $(prev_txt).empty()
                $(prev_txt).append(orig_text)                                
            } else {
                $(nodes).unwrap();                
            }
        }   
    }
}

$(document).mousestop(function() {
    if(first_stop && not_emitted) {
        not_emitted = false
        self.port.emit("get-enable-state")
    } else if (!first_stop) {
        if (enabled) {
            mouse_hover()
        }
    }
});

self.port.on("recieve-enable-state",function(enable_state) {
    enabled = enable_state
    first_stop = false
    
    if(enabled) {
        mouse_hover()
    }
});

self.port.on("recieve-apy-url",function(apy_url) {
    pref_apy_url = apy_url
});

self.port.on("prefchanged",function(enable_state) {
    enabled = enable_state
})

function htmlEscape(string) {
    return String(string).replace(/[&<>]/g, function (s) {
      return escapeChars[s];
    });
  }