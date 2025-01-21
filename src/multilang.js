function loadLanguage(lang) {
    fetch(`lang/${lang}.json`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('title').innerText = data.title;
            document.getElementById('description').innerText = data.description;
            document.getElementById('functionality').innerText = data.functionality;
            document.getElementById('queryExplanation').innerText = data.queryExplanation;
            document.getElementById('queryLine').innerText = data.queryLine;
            document.getElementById('queryDescription').innerText = data.queryDescription;
            document.getElementById('startLanguageLabel').innerText = data.startLanguage;
            document.getElementById('goalLanguageLabel').innerText = data.goalLanguage;
            document.getElementById('myInput').placeholder = data.searchPlaceholder;
            document.getElementById('searchButton').value = data.searchButton;
            document.getElementById('startLang_en').innerText = data.startLang_en;
            document.getElementById('startLang_de').innerText = data.startLang_de;
            document.getElementById('startLang_ja').innerText = data.startLang_ja;
            document.getElementById('goalLang_en').innerText = data.goalLang_en;
            document.getElementById('goalLang_de').innerText = data.goalLang_de;
            document.getElementById('goalLang_ja').innerText = data.goalLang_ja;

            let flag = document.getElementById('output').dataset.flag;
            if (flag == "true") {
                document.getElementById('output1stRow').textContent = data.output.firstRow;
                document.getElementById('output2ndRow').textContent = data.output.secondRow;
                document.getElementById('output3rdRow').textContent = data.output.thirdRow;

                const descriptionRow = document.getElementById('output2ndRow');
                if (descriptionRow.dataset.resultFlag == "true") {
                    descriptionRow.textContent = data.output.secondRowContent;
                }

                const wikiLink = document.getElementById('wikiLink');
                if (wikiLink.dataset.resultFlag == "true") {
                    wikiLink.textContent = data.output.thirdRowContent;
                }
            }
        });
}


// first, load the default language
loadLanguage('de');


const languageSelector = document.getElementById('languageSelector');
languageSelector.addEventListener('change', (event) => {
    loadLanguage(event.target.value);
});


