function phpfuzz(){
    this.iterations = 2;
    this.output_phpwrap = true;
    this.enable_string_obfuscation = true;
    this.enable_tamper_profing = true;
    this.tamper_strings = ['/* eval ( */', '/* *-* --- --*///\' ( */'];
    this.obf_table = [];
    
    this.obfuscate = function (code){
        if (code) {
            var chunks = code.match(/<\?php.*?>/g);
            for (var chunk in chunks){
                var original = chunks[chunk];
                chunks[chunk] = this.trim(this.phpstrip(chunks[chunk]));
                for (var i = 0; i < this.iterations; i++){
                    chunks[chunk] = this.iteration(chunks[chunk]);
                }
                code = code.replace(original, this.phpwrap(chunks[chunk]));
            }
        }
        return code;
    }
    this.iteration = function (code){
        return this.evalwrap("base64_decode('" + this.encode64(code) + "')");
    }
    this.evalwrap = function (code){
        return 'eval(' + code + ');';
    }
    this.phpwrap = function (code){
        return '<?php ' + code + ' ?>';
    }
    this.phpstrip = function (code){
        code = code.replace('?>', '');
        return code.replace('<?php', '');
    }
    
    this.addslashes = function (code){
        return code.replace("'", "\\'");
    }
    
    this.trim = function trim(s) {
        return s.replace(/^\s+|\s+$/g,"");
    }
    
    this.encode64  = function (input) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        //input = escape(input);
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);
        
        return output;
    }
}    
