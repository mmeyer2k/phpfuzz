function phpfuzz(){
    this.iterations = 2; // specify number of rounds
    this.fuzz_tampers = false; // specify whether tamper strings will be inserted on each iteration
    this.fuzz_strings = false; //
    this.fuzz_numbers = false; //
    this.fuzz_mask_unpackers = false;
    
    this.shuffle = function(o){
        for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }
    
    // list of tamper strings to insert randomly which fool deobfuscators
    this.tamper_strings = [
    '/*eval("*/', 
    '/*base64_decode("*/',
    '/*base64_decode"*/',
    '/**/',
    '/***/',
    '/**-/*\\/*-----*///\'(*/'
    ];
    
    this.obf_table = [];
    
    this.obfuscate = function (code){
        if (code) {
            var chunks = code.match(/<\?php?(.*[\s\S])*?\?>/g);
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
    
    this.tamper = function (code){
        if (this.fuzz_tampers){
            this.tamper_strings = this.shuffle(this.tamper_strings);
            code = this.tamper_strings[0] + code;
        }
        return code;
    }
    
    this.iteration = function (code){
        code = this.tamper(code);
        return this.evalwrap("base64_decode('" + this.encode64(code) + "')");
    }
    
    this.evalwrap = function (code){
        if (this.fuzz_mask_unpackers){
            var fn = '$_____e' + Math.floor(Math.random() * 10000000001);
            // print out a string of functions that evaluates to 'eval'
            // ascii 101 118 97 108
            var eval = "chr(101).chr(118)."; // ev
            eval += "chr(97).chr(108)"; //al
            return fn + '=' + eval + ';' + fn + '(' + code + ');';
        } else {
            return 'eval(' + code + ');';
        }

    }
    this.phpwrap = function (code){
        return '<?php ' + code + ' ?>';
    }
    
    
    this.phpstrip = function (code){
        code = this.trim(code);
        
        if (typeof code !== "string")
            return false;
        
        if (code){
            code = code.replace('?>', '');
            return code.replace('<?php', '');
        }
        return code;
    }
    
    this.addslashes = function (code){
        return code.replace("'", "\\'");
    }
    
    this.trim = function trim(s) {
        if (s){
            s = s.replace(/^\s+|\s+$/g, "");
        }
        return s;
    }
    
    this.encode64  = function (input) {
        if (!input){
            return false;
        }
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
