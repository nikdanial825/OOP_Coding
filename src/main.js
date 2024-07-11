let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function searchWord() {
    const word = document.getElementById('word').value.trim();
    const type = document.getElementById('type').value.trim();

    let apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const entryContainer = document.getElementById('entryContainer');
            entryContainer.innerHTML = '';

            if (data.length > 0) {
                const entry = data[0];
                let entryHTML = `<div class="word-info">`;
                entryHTML += `<h2>${entry.word}</h2>`;
                if (entry.phonetics && entry.phonetics.length > 0) {
                    const phonetic = entry.phonetics[0];
                    if (phonetic.audio) {
                        entryHTML += `<audio controls><source src="${phonetic.audio}" type="audio/mpeg">Your browser does not support the audio element.</audio>`;
                    } else {
                        entryHTML += `<p>Audio for this word doesn't exist</p>`;
                    }
                    if (phonetic.sourceUrl) {
                        entryHTML += `<p><a href="${phonetic.sourceUrl}" target="_blank">${phonetic.sourceUrl}</a></p>`;
                    } else {
                        entryHTML += `<p>No source URL available</p>`;
                    }
                }
                entryHTML += `<button onclick="addToFavorites('${entry.word}', '${entry.phonetics[0]?.audio || ''}', '${entry.phonetics[0]?.sourceUrl || ''}')">Add to Favorites</button>`;
                entryHTML += `</div>`;
                entryContainer.innerHTML = entryHTML;

                data.forEach(entry => {
                    entry.meanings.forEach(meaning => {
                        if (type && meaning.partOfSpeech !== type) {
                            return;
                        }
                        let meaningsHTML = `<div class="meanings">`;
                        meaningsHTML += `<h3>${meaning.partOfSpeech}</h3>`;
                        if (meaning.definitions && meaning.definitions.length > 0) {
                            meaningsHTML += `<div class="definitions">`;
                            meaningsHTML += `<h4>Definitions:</h4>`;
                            meaning.definitions.slice(0, 3).forEach(definition => {
                                meaningsHTML += `<p>${definition.definition}</p>`;
                            });
                            meaningsHTML += `</div>`;
                        }
                        if (meaning.definitions[0].example) {
                            meaningsHTML += `<div class="examples">`;
                            meaningsHTML += `<h4>Examples:</h4>`;
                            meaningsHTML += `<p>${meaning.definitions[0].example}</p>`;
                            meaningsHTML += `</div>`;
                        }
                        if (meaning.synonyms && meaning.synonyms.length > 0) {
                            meaningsHTML += `<div class="synonyms">`;
                            meaningsHTML += `<h4>Synonyms:</h4>`;
                            meaningsHTML += `<p>${meaning.synonyms.join(', ')}</p>`;
                            meaningsHTML += `</div>`;
                        }
                        if (meaning.antonyms && meaning.antonyms.length > 0) {
                            meaningsHTML += `<div class="antonyms">`;
                            meaningsHTML += `<h4>Antonyms:</h4>`;
                            meaningsHTML += `<p>${meaning.antonyms.join(', ')}</p>`;
                            meaningsHTML += `</div>`;
                        }
                        meaningsHTML += `</div>`;
                        entryContainer.innerHTML += meaningsHTML;
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function addToFavorites(word, audio, sourceUrl) {
    const existingFavorite = favorites.find(fav => fav.word === word);
    if (!existingFavorite) {
        favorites.push({ word, audio, sourceUrl, remark: '' });
        alert(`${word} has been added to favorites.`);
        updateLocalStorage();
    } else {
        alert(`${word} is already in favorites.`);
    }
}

function updateLocalStorage() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function deleteFavorite(word) {
    favorites = favorites.filter(fav => fav.word !== word);
    updateLocalStorage();
    displayFavorites();
}

function saveRemark(word) {
    const textarea = document.querySelector(`textarea[data-word="${word}"]`);
    const remark = textarea.value;
    const favorite = favorites.find(fav => fav.word === word);
    if (favorite) {
        favorite.remark = remark;
        updateLocalStorage();
        alert(`Remark for ${word} has been saved.`);
        displayFavorites();
    }
}

function editRemark(word) {
  const textarea = document.querySelector(`textarea[data-word="${word}"]`);
  const editButton = document.querySelector(`button[data-edit-word="${word}"]`);
  const saveButton = document.querySelector(`button[data-save-word="${word}"]`);

  textarea.disabled = false;
  textarea.style.display = 'block';
  editButton.style.display = 'none';
  saveButton.style.display = 'inline-block';
}

function displayFavorites() {
  const favoritesContainer = document.getElementById('favoritesContainer');
  favoritesContainer.innerHTML = '';

  favorites.forEach(favorite => {
      favoritesContainer.innerHTML += `
          <tr>
              <td>${favorite.word}</td>
              <td>${favorite.audio ? `<audio controls src="${favorite.audio}">Your browser does not support the audio element.</audio>` : 'Audio for this word didn\'t exist'}</td>
              <td>
                  ${favorite.sourceUrl ? `<p><a href="${favorite.sourceUrl}" target="_blank">${favorite.sourceUrl}</a></p>` : 'Link for this word didn\'t exist'}
              </td>
              <td>
                  <textarea data-word="${favorite.word}" placeholder="Add a remark" disabled>${favorite.remark}</textarea>
              </td>
              <td>
                  <button data-edit-word="${favorite.word}" onclick="editRemark('${favorite.word}')">Update</button>
                  <button data-save-word="${favorite.word}" style="display:none;" onclick="saveRemark('${favorite.word}')">Save</button>
                  <button onclick="deleteFavorite('${favorite.word}')">Delete</button>
              </td>
          </tr>
      `;
  });
}
