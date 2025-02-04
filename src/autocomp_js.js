function createSPARQLQueryJSforAutComp(inputWord) {
    
    return `SELECT DISTINCT ?label WHERE {
	?pers rdfs:label ?label ;
        rdf:type type:Person .
        FILTER regex(?label, "${inputWord}", "i")
}
LIMIT 10`;
}

function autocompleteJS(input) {
    
    var currentFocus;
    
    input.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        
        closeAllLists();
        if (!val) { return false;}
        const query = createSPARQLQueryJSforAutComp(val);
        fetch("https://jpsearch.go.jp/rdf/sparql?default-graph-uri=&query=" + encodeURIComponent(query), {
            headers: {
            Accept: "application/sparql-results+json"
            }})
            .then(response => response.json())
            .then(data => {
                
                let results = data.results.bindings;
                if (results.length === 0) {
                    return;
                } else {
                    let arr = [];
                    results.map(result => {
                        arr.push(result.label.value);
                    });
                    if (!arr || arr.length === 0) { return false; }
                    //console.log(arr);
                    currentFocus = -1;
            
                    a = document.createElement("DIV");
                    a.setAttribute("id", this.id + "autocomplete-list");
                    a.setAttribute("class", "autocomplete-items");
                    this.parentNode.appendChild(a);
            
                    for (i = 0; i < arr.length; i++) {
                        if (arr[i].includes(val)) {
                            b = document.createElement("DIV");
                            let startIndex = arr[i].indexOf(val);
                            b.innerHTML = arr[i].substr(0, startIndex);
                            b.innerHTML += "<strong>" + arr[i].substr(startIndex, val.length) + "</strong>";
                            b.innerHTML += arr[i].substr(startIndex + val.length);
                            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                            b.addEventListener("click", function(e) {
                                input.value = this.getElementsByTagName("input")[0].value;
                                closeAllLists(e.target);
                            });
                            a.appendChild(b);
                        }
                    }
                }});
    });
    
    input.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) { 
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != input) {
            x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    autocompleteJS(document.getElementById("input_js"));
});
