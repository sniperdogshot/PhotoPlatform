const API_URL = "http://127.0.0.1:8000";

const token = localStorage.getItem("access_token");

const params = new URLSearchParams(
    window.location.search
);

const albumId = params.get("album");


// ========================================
// PROTEÇÃO
// ========================================

if (!token) {
    window.location.href = "login.html";
}


// ========================================
// ELEMENTOS
// ========================================

const albumName =
    document.getElementById("album-name");

const photoCount =
    document.getElementById("photo-count");

const photosContainer =
    document.getElementById("photos");

const photosLoading =
    document.getElementById("photos-loading");

const error =
    document.getElementById("error");

const backButton =
    document.getElementById("back-button");

const photoInput =
    document.getElementById("photo-input");

const uploadButton =
    document.getElementById("upload-button");

const uploadStatus =
    document.getElementById("upload-status");


// ========================================
// HEADERS
// ========================================

function authHeaders() {

    return {
        "Authorization":
            `Bearer ${token}`
    };

}


// ========================================
// VOLTAR
// ========================================

backButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "admin.html";

    }
);


// ========================================
// CARREGAR ÁLBUM
// ========================================

async function loadAlbum() {

    if (!albumId) {

        showError(
            "Álbum não informado."
        );

        return;
    }


    console.log(
        "Carregando álbum:",
        albumId
    );


    try {

        const response =
            await fetch(
                `${API_URL}/albums/${albumId}`,
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


        const album =
            await response.json();


        console.log(
            "Álbum recebido:",
            album
        );


        albumName.textContent =
            album.name;


        await loadPhotos();


    } catch (err) {

        console.error(
            "Erro ao carregar álbum:",
            err
        );


        showError(
            "Não foi possível carregar o álbum."
        );

    }

}


// ========================================
// CARREGAR FOTOS
// ========================================

async function loadPhotos() {

    photosLoading.classList.remove(
        "hidden"
    );


    photosContainer.innerHTML = "";


    try {

        const response =
            await fetch(
                `${API_URL}/photos/album/${albumId}`,
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


        const photos =
            await response.json();


        console.log(
            "Fotos recebidas:",
            photos
        );


        photoCount.textContent =
            `${photos.length} foto(s)`;


        renderPhotos(photos);


    } catch (err) {

        console.error(
            "Erro ao carregar fotos:",
            err
        );


        showError(
            "Não foi possível carregar as fotos."
        );


    } finally {

        photosLoading.classList.add(
            "hidden"
        );

    }

}


// ========================================
// RENDERIZAR FOTOS
// ========================================

async function renderPhotos(photos) {

    photosContainer.innerHTML = "";


    if (
        !photos ||
        photos.length === 0
    ) {

        photosContainer.innerHTML = `
            <div class="message">
                Nenhuma foto neste álbum.
            </div>
        `;

        return;
    }


    for (const photo of photos) {

        const card =
            document.createElement("article");


        card.className =
            "photo-card";


        // ====================================
        // IMAGEM
        // ====================================

        const image =
            document.createElement("img");


        image.alt =
            photo.filename;


        image.loading =
            "lazy";


        image.className =
            "photo-image";


        /*
         * O endpoint /photos/{id}/preview
         * exige Authorization.
         *
         * Por isso fazemos fetch manualmente.
         */

        try {

            const response =
                await fetch(
                    `${API_URL}/photos/${photo.id}/preview`,
                    {
                        method: "GET",
                        headers: authHeaders()
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Imagem HTTP ${response.status}`
                );

            }


            const blob =
                await response.blob();


            const imageUrl =
                URL.createObjectURL(blob);


            image.src =
                imageUrl;


            /*
             * Libera a URL quando a imagem
             * não for mais necessária.
             */

            image.addEventListener(
                "load",
                function () {

                    // Mantemos a imagem disponível
                    // enquanto o card existir.

                }
            );


        } catch (err) {

            console.error(
                `Erro ao carregar foto ${photo.id}:`,
                err
            );


            image.alt =
                "Erro ao carregar imagem.";

        }


        // ====================================
        // INFORMAÇÕES
        // ====================================

        const info =
            document.createElement("div");


        info.className =
            "photo-info";


        const filename =
            document.createElement("p");


        filename.textContent =
            photo.filename;


        info.appendChild(
            filename
        );


        // ====================================
        // CARD
        // ====================================

        card.appendChild(
            image
        );


        card.appendChild(
            info
        );


        // ====================================
        // CLIQUE
        // ====================================

        card.addEventListener(
            "click",
            function () {

                openPhoto(photo);

            }
        );


        photosContainer.appendChild(
            card
        );

    }

}


// ========================================
// ABRIR FOTO
// ========================================

async function openPhoto(photo) {

    try {

        const response =
            await fetch(
                `${API_URL}/photos/${photo.id}/preview`,
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                `Erro HTTP ${response.status}`
            );

        }


        const blob =
            await response.blob();


        const imageUrl =
            URL.createObjectURL(blob);


        window.open(
            imageUrl,
            "_blank"
        );


    } catch (err) {

        console.error(
            "Erro ao abrir foto:",
            err
        );


        alert(
            "Não foi possível abrir a foto."
        );

    }

}


// ========================================
// UPLOAD
// ========================================

photoInput.addEventListener(
    "change",
    function () {

        uploadButton.disabled =
            photoInput.files.length === 0;

    }
);


uploadButton.addEventListener(
    "click",
    uploadPhotos
);


async function uploadPhotos() {

    const files =
        photoInput.files;


    if (!files.length) {

        return;
    }


    uploadButton.disabled =
        true;


    uploadStatus.textContent =
        `Enviando ${files.length} foto(s)...`;


    try {

        for (
            let i = 0;
            i < files.length;
            i++
        ) {

            const file =
                files[i];


            const formData =
                new FormData();


            formData.append(
                "album_id",
                albumId
            );


            formData.append(
                "file",
                file
            );


            const response =
                await fetch(
                    `${API_URL}/photos/upload`,
                    {
                        method: "POST",

                        headers:
                            authHeaders(),

                        body:
                            formData
                    }
                );


            if (response.status === 401) {

                logout();

                return;
            }


            if (!response.ok) {

                const data =
                    await response.json();


                throw new Error(
                    data.detail ||
                    `Erro HTTP ${response.status}`
                );

            }


            uploadStatus.textContent =
                `Enviando ${i + 1} de ${files.length}...`;

        }


        uploadStatus.textContent =
            "Fotos enviadas com sucesso!";


        photoInput.value = "";


        uploadButton.disabled =
            true;


        await loadPhotos();


    } catch (err) {

        console.error(
            "Erro no upload:",
            err
        );


        uploadStatus.textContent =
            "Erro: " + err.message;


    } finally {

        uploadButton.disabled =
            photoInput.files.length === 0;

    }

}


// ========================================
// ERRO
// ========================================

function showError(message) {

    error.textContent =
        message;

    error.classList.remove(
        "hidden"
    );

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


// ========================================
// INICIAR
// ========================================

loadAlbum();