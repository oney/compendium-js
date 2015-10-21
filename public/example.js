(function() {

    var input = document.querySelector('#pos-demo-input'),
        random = document.querySelector('#pos-demo-random'),
        langages = $(".btn-group > .btn"),
        lastTotal = 0,
        lang,
        QueryString,
        round = function(f) {
            return parseInt(f * 100, 10) / 100;
        },
        analyse = function(txt) {
            var n = Date.now(),
                analysis = compendium.analyse(txt);
            lastTotal = Date.now() - n;
            return analysis;
        };


    QueryString = (function(a) {
          if (a == "") return {};
          var b = {};
          for (var i = 0; i < a.length; ++i)
          {
              var p=a[i].split('=');
              if (p.length != 2) continue;
              b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
          }
          return b;
        })(window.location.search.substr(1).split('&'));

    lang = !!QueryString["l"]?QueryString["l"]: "en";



    function buildHtml(sentences, container) {
        var i, j, l, m, k, n,
            token,

            d = document,
            p = d.createElement('p'),
            sentenceSpan,
            tokenContainer,
            tokenSpan,
            inEntity = false,
            classe,
            entity,
            flags,
            label,
            html,
            tmp,
            tmp2,
            deps2,
            tmp3,
            things = {},
            characteristics = [],
            norm,
            span,
            span2;

        for (i = 0, l = sentences.length; i < l; i += 1) {
            sentenceSpan = d.createElement('div');
            sentenceSpan.setAttribute('class', 'sentence');

            classe = sentences[i].profile.label;
            span = d.createElement('div'),
            span.setAttribute('class', 'meta');
            span.innerHTML = ' <span>Confidence:&nbsp;' + round(sentences[i].stats.confidence)  + '</span>' +
                            ' <span>Sentiment score:&nbsp;' + round(sentences[i].profile.sentiment)  + ', ' +
                            'amplitude:&nbsp;' + round(sentences[i].profile.amplitude)  + ', ' +
                            'emphasis:&nbsp;' + round(sentences[i].profile.emphasis)  + '</span>';
            sentenceSpan.appendChild(span);






            flags = d.createElement('div'),
            flags.setAttribute('class', 'types');
            sentenceSpan.appendChild(flags);

            if (sentences[i].profile.types.length > 0) {
                flags.innerHTML = '<span class="bg-info">' +
                    sentences[i].profile.types.join('</span><span class="bg-info">') + '</span>';
            }

            label = sentences[i].profile.label;
            if (label === 'neutral') {
                flags.innerHTML += '<span class="bg-info">neutral</span>';
            } else if (label === 'mixed') {
                flags.innerHTML += '<span class="bg-orange">mixed</span>';
            } else if (label === 'positive') {
                flags.innerHTML += '<span class="bg-green">positive</span>';
            } else {
                flags.innerHTML += '<span class="bg-red">negative</span>';
            }

            tokenContainer = sentenceSpan;
            for (j = 0, m = sentences[i].tokens.length; j < m; j += 1) {
                token = sentences[i].tokens[j];
                if (token.attr.entity > -1) {
                    if (inEntity === false || inEntity !== token.attr.entity) {
                        if (inEntity !== false && inEntity !== token.attr.entity) {
                            sentenceSpan.appendChild(tokenContainer);
                        }
                        inEntity = token.attr.entity;
                        tokenContainer = d.createElement('div');
                        tokenContainer.setAttribute('class', 'entity-block');
                    }
                } else if (inEntity !== false) {
                    inEntity = false;
                    sentenceSpan.appendChild(tokenContainer);
                    tokenContainer = sentenceSpan;
                }

                tokenSpan = d.createElement('div');
                tokenSpan.setAttribute('class', 'token');

                span = d.createElement('div');
                span.setAttribute('class', 'raw');
                span.innerText = token.raw;
                tokenSpan.appendChild(span);
                classe = 'raw ';
                if (token.attr.entity > -1) {
                    classe += 'is_entity ';
                }

                if (token.profile.sentiment > 0) {
                    classe += 'positive ';
                } else if (token.profile.sentiment < 0) {
                    classe += 'negative ';
                }

                if (token.profile.emphasis > 1) {
                    classe += 'emphasized ';
                }

                span.setAttribute('class', classe);

                span = d.createElement('div');
                span.setAttribute('class', 'pos');
                span.innerText = token.pos;

                if (token.profile.sentiment > 0) {
                    span.innerText += ' / +' + token.profile.sentiment;
                } else if (token.profile.sentiment < 0) {
                    span.innerText += ' / ' + token.profile.sentiment;
                }
                tokenSpan.appendChild(span);

                // Get entity
                if (token.attr.entity > -1) {
                    entity = sentences[i].entities[token.attr.entity];

                    span = d.createElement('div');
                    span.setAttribute('class', 'entity');
                    span.innerText = entity.type;
                    tokenSpan.appendChild(span);
                }

                tokenContainer.appendChild(tokenSpan);
            }
            p.appendChild(tokenContainer);
        }

        while (container.hasChildNodes()) {
            container.removeChild(container.lastChild);
        }
        document.querySelector('#time').innerText = lastTotal;
        container.appendChild(p);
        return p;
    };

    function getRandomSample() {
        var samples = examples[lang];
        var t = samples[Math.floor(Math.random() * (samples.length))];
        return t;
    };


    random.addEventListener('click', function() {
        input.value = getRandomSample();
        renderAnalyse();
    });

    var prev;
    input.addEventListener('keyup', function() {
        var v = input.value;
        if (!v || v === prev) {return;}
        buildHtml(analyse(v), document.querySelector('#pos-demo-result'));
        prev = v;
    });

    langages.click(function(){
      var url = window.location.pathname;
      url+="?l="+$(this).data("lang");
      window.location.replace(url);
    });




    var renderAnalyse = function(){
      if(input.value === ""){
        input.value = getRandomSample();
      }
      buildHtml(analyse(input.value), document.querySelector('#pos-demo-result'));
    }
    var renderLangageButton = function(){
      var lang = getLangage();
      $(".lang-"+lang).addClass("active").siblings().removeClass("active");
    }


    var loadCompendium = function(lang, mode){
      var dirName= "./dist"
      if(document.location.search.match("debug=x")){
          dirName = "../build"
      }
      var compendiumSource = dirName + '/compendium-{{lang}}.minimal.js';
      if (lang === "en" || !lang){
        compendiumSource = dirName + '/compendium.minimal.js';
      }
      else{
        compendiumSource=compendiumSource.replace('{{lang}}', lang);
      }

       $.ajax({
            crossDomain: true,
            dataType: "script",
            url: compendiumSource,
            success: function(){
              showMessage(lang);
              renderAnalyse();
            },
            error: function(){
                _fail(_slot);
            }
        })
    }

    var showMessage = function(lang){
        $('.lg .message').text("Language "+lang+" has been selected").show().delay(3000).fadeOut(1000);;

    };

    var getLangage = function(){
        return lang;
    }

    loadCompendium(lang);

    renderLangageButton();
    input.focus();
    input.setSelectionRange(0, input.value.length);



}());
