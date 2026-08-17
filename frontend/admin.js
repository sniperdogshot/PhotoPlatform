const API_URL = "http://127.0.0.1:8000";

const token = localStorage.getItem("access_token");


// ========================================
// PROTEGER PAINEL
// ========================================

if (!token) {
    window.location.href = "login.html";
}


// ========================================
// ELEMENTOS
// ========================================

const albumsContainer =
    document.getElementById("albums");

const loading =
    document.getElementById("loading");

const error =
    document.getElementById("error");

const logoutButton =
    document.getElementById("logout-button");

const newAlbumButton =
    document.getElementById("new-album-button");

const albumModal =
    document.getElementById("album-modal");

const albumModalClose =
    document.getElementById("album-modal-close");

const cancelAlbumButton =
    document.getElementById("cancel-album-button");

const albumForm =
    document.getElementById("album-form");

const albumNameInput =
    document.getElementById("album-name-input");

const albumFormError =
    document.getElementById("album-form-error");


// ========================================
// HEADERS
// ========================================

function authHeaders() {

    return {
        "Authorization": `Bearer ${token}`
    };

}


// ========================================
// ABRIR MODAL
// ========================================

function openAlbumModal() {

    albumNameInput.value = "";

    albumFormError.textContent = "";

    albumFormError.classList.add("hidden");

    albumModal.classList.remove("hidden");

    albumNameInput.focus();

}


// ========================================
// FECHAR MODAL
// ========================================

function closeAlbumModal() {

    albumModal.classList.add("hidden");

}


// ========================================
// CARREGAR ÁLBUNS
// ========================================

async function loadAlbums() {

    loading.classList.remove("hidden");

    error.classList.add("hidden");

    try {

        const response = await fetch(
            `${API_URL}/albums/`,
            {
                method: "GET",
                headers: authHeaders()
            }
        );


        if (response.status === 401) {

            logout();

            return;

        }


        if (!response.ok) {

            throw new Error(
                `Erro HTTP ${response.status}`
            );

        }


        const albums =
            await response.json();


        renderAlbums(albums);


    } catch (err) {

        console.error(
            "Erro ao carregar álbuns:",
            err
        );

        showError(
            "Não foi possível carregar os álbuns."
        );

    } finally {

        loading.classList.add("hidden");

    }

}


// ========================================
// RENDERIZAR ÁLBUNS
// ========================================

function renderAlbums(albums) {

    albumsContainer.innerHTML = "";


    if (!albums || albums.length === 0) {

        albumsContainer.innerHTML = `
            <div class="message">
                Nenhum álbum criado ainda.
            </div>
        `;

        return;

    }


    albums.forEach(album => {

        const card =
            document.createElement("article");

        card.className = "album-card";


        card.innerHTML = `
            <div class="album-card-content">

                <h3>
                    ${escapeHtml(album.name)}
                </h3>

                <p>
                    Álbum #${album.id}
                </p>

            </div>

            <div class="album-actions">

                <button
                    class="button"
                    data-action="open"
                    data-id="${album.id}">
                    Abrir
                </button>

                <button
                    class="button secondary"
                    data-action="delete"
                    data-id="${album.id}">
                    Excluir
                </button>

            </div>
        `;


        albumsContainer.appendChild(card);

    });


    const openButtons =
        document.querySelectorAll(
            '[data-action="open"]'
        );


    openButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const id =
                    button.dataset.id;

                window.location.href =
                    `album.html?album=${id}`;

            }
        );

    });


    const deleteButtons =
        document.querySelectorAll(
            '[data-action="delete"]'
        );


    deleteButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const id =
                    button.dataset.id;

                deleteAlbum(id);

            }
        );

    });

}


// ========================================
// CRIAR ÁLBUM
// ========================================

albumForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            albumNameInput.value.trim();


        if (!name) {

            albumFormError.textContent =
                "Digite o nome do álbum.";

            albumFormError.classList.remove(
                "hidden"
            );

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/albums/`,
                    {
                        method: "POST",

                        headers: {
                            ...authHeaders(),
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name: name
                        })
                    }
                );


            if (response.status === 401) {

                logout();

                return;

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Não foi possível criar o álbum."
                );

            }


            closeAlbumModal();

            await loadAlbums();


        } catch (err) {

            console.error(
                "Erro ao criar álbum:",
                err
            );


            albumFormError.textContent =
                err.message;


            albumFormError.classList.remove(
                "hidden"
            );

        }

    }
);


// ========================================
// EXCLUIR ÁLBUM
// ========================================

async function deleteAlbum(id) {

    const confirmed =
        confirm(
            "Tem certeza que deseja excluir este álbum?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/albums/${id}`,
                {
                    method: "DELETE",

                    headers: authHeaders()
                }
            );


        if (response.status === 401) {

            logout();

            return;

        }


        if (!response.ok) {

            let message =
                "Não foi possível excluir o álbum.";

            try {

                const data =
                    await response.json();

                if (data.detail) {
                    message = data.detail;
                }

            } catch {

            }

            throw new Error(message);

        }


        await loadAlbums();


    } catch (err) {

        console.error(
            "Erro ao excluir álbum:",
            err
        );

        showError(err.message);

    }

}


// ========================================
// LOGOUT
// ========================================

function logout() {

    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "token_type"
    );

    window.location.href =
        "login.html";

}


logoutButton.addEventListener(
    "click",
    logout
);


// ========================================
// EVENTOS DO MODAL
// ========================================

newAlbumButton.addEventListener(
    "click",
    openAlbumModal
);


albumModalClose.addEventListener(
    "click",
    closeAlbumModal
);


cancelAlbumButton.addEventListener(
    "click",
    closeAlbumModal
);


albumModal.addEventListener(
    "click",
    function (event) {

        if (event.target === albumModal) {

            closeAlbumModal();

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeAlbumModal();

        }

    }
);


// ========================================
// ERRO
// ========================================

function showError(message) {

    error.textContent = message;

    error.classList.remove(
        "hidden"
    );

}


// ========================================
// SEGURANÇA BÁSICA
// ========================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ========================================
// INICIAR
// ========================================

loadAlbums();
