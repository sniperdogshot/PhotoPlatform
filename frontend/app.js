const API_URL = "http://127.0.0.1:8000";

const params = new URLSearchParams(window.location.search);
const albumId = params.get("album") || "1";

const albumName = document.getElementById("album-name");
const gallery = document.getElementById("gallery");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

const modal = document.getElementById("modal");
const modalImage = document.getElementById("modal-image");
const modalClose = document.getElementById("modal-close");

let currentPhoto = null;


// =====================================================
// CARREGAR ÁLBUM
// =====================================================

async function loadAlbum() {

    console.log("Carregando álbum:", albumId);

    const url = `${API_URL}/public/albums/${albumId}`;

    console.log("URL da API:", url);

    try {

        const response = await fetch(url);

        console.log(
            "Status da API:",
            response.status
        );

        if (!response.ok) {

            throw new Error(
                `API retornou HTTP ${response.status}`
            );
        }

        const album = await response.json();

        console.log(
            "Álbum recebido:",
            album
        );

        albumName.textContent = album.name;

        renderPhotos(album.photos);

    } catch (err) {

        console.error(
            "ERRO AO CARREGAR ÁLBUM:",
            err
        );

        error.textContent =
            "Erro ao carregar álbum: " + err.message;

        error.classList.remove("hidden");

    } finally {

        loading.classList.add("hidden");
    }
}


// =====================================================
// RENDERIZAR FOTOS
// =====================================================

function renderPhotos(photos) {

    gallery.innerHTML = "";

    if (!photos || photos.length === 0) {

        gallery.innerHTML = `
            <div class="message">
                Nenhuma foto disponível.
            </div>
        `;

        return;
    }

    photos.forEach(photo => {

        const card =
            document.createElement("div");

        card.className = "photo-card";


        // ---------------------------------------------
        // IMAGEM
        // ---------------------------------------------

        const image =
            document.createElement("img");

        image.src =
            API_URL + photo.preview_url;

        image.alt =
            photo.filename;

        image.loading = "lazy";


        // ---------------------------------------------
        // INFORMAÇÕES
        // ---------------------------------------------

        const info =
            document.createElement("div");

        info.className =
            "photo-info";


        const filename =
            document.createElement("p");

        filename.textContent =
            photo.filename;


        info.appendChild(filename);


        card.appendChild(image);
        card.appendChild(info);


        // ---------------------------------------------
        // ABRIR MODAL
        // ---------------------------------------------

        card.addEventListener(
            "click",
            () => {

                openModal(photo);

            }
        );


        gallery.appendChild(card);

    });
}


// =====================================================
// ABRIR MODAL
// =====================================================

function openModal(photo) {

    currentPhoto = photo;

    console.log(
        "Abrindo foto:",
        photo
    );


    // ---------------------------------------------
    // URL DA PREVIEW
    // ---------------------------------------------

    const imageUrl =
        API_URL + photo.preview_url;


    modalImage.src =
        imageUrl;

    modalImage.alt =
        photo.filename;


    // ---------------------------------------------
    // BOTÃO DOWNLOAD
    // ---------------------------------------------

    let downloadButton =
        document.getElementById(
            "download-button"
        );


    if (!downloadButton) {

        downloadButton =
            document.createElement("a");

        downloadButton.id =
            "download-button";

        downloadButton.className =
            "download-button";

        downloadButton.textContent =
            "Baixar original";


        downloadButton.target =
            "_blank";

        downloadButton.rel =
            "noopener noreferrer";


        modal.appendChild(
            downloadButton
        );
    }


    // ---------------------------------------------
    // URL DO ORIGINAL
    // ---------------------------------------------

    downloadButton.href =
        `${API_URL}/public/photos/${photo.id}/original`;


    // ---------------------------------------------
    // MOSTRAR MODAL
    // ---------------------------------------------

    modal.classList.remove(
        "hidden"
    );


    // ---------------------------------------------
    // BLOQUEAR SCROLL DA PÁGINA
    // ---------------------------------------------

    document.body.style.overflow =
        "hidden";
}


// =====================================================
// FECHAR MODAL
// =====================================================

function closeModal() {

    modal.classList.add(
        "hidden"
    );


    modalImage.src =
        "";


    modalImage.alt =
        "";


    currentPhoto =
        null;


    document.body.style.overflow =
        "";
}


// =====================================================
// DOWNLOAD DO ORIGINAL
// =====================================================

async function downloadOriginal() {

    if (!currentPhoto) {

        console.warn(
            "Nenhuma foto selecionada."
        );

        return;
    }


    const url =
        `${API_URL}/public/photos/${currentPhoto.id}/original`;


    console.log(
        "Baixando:",
        url
    );


    try {

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const blob =
            await response.blob();


        const blobUrl =
            window.URL.createObjectURL(
                blob
            );


        const link =
            document.createElement("a");


        link.href =
            blobUrl;


        link.download =
            currentPhoto.filename;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        window.URL.revokeObjectURL(
            blobUrl
        );


    } catch (err) {

        console.error(
            "Erro ao baixar:",
            err
        );


        alert(
            "Não foi possível baixar a foto."
        );
    }
}


// =====================================================
// EVENTO DO BOTÃO FECHAR
// =====================================================

modalClose.addEventListener(
    "click",
    () => {

        closeModal();

    }
);


// =====================================================
// CLIQUE FORA DA FOTO
// =====================================================

modal.addEventListener(
    "click",
    event => {

        if (
            event.target === modal
        ) {

            closeModal();

        }
    }
);


// =====================================================
// TECLA ESC
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }
    }
);


// =====================================================
// TECLA ENTER NO DOWNLOAD
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            currentPhoto &&
            !modal.classList.contains("hidden")
        ) {

            const downloadButton =
                document.getElementById(
                    "download-button"
                );

            if (downloadButton) {

                downloadButton.click();

            }
        }
    }
);


// =====================================================
// INICIAR APLICAÇÃO
// =====================================================

loadAlbum();