document.body.setAttribute('ondrop', 'dropHandler(event);');
document.body.setAttribute('ondragover', 'dragOverHandler(event);')

window.onload = () => {
    document
        .getElementById('upload-button')
        .addEventListener('change', event => {
            upload(event.target.files[0]);
        });
}

function dragOverHandler(ev) {
    // Prevent browser from opening file
    ev.preventDefault();
}

function upload(file) {
    const formdata = new FormData();

    formdata.append('file', file);

    const request = new XMLHttpRequest();
    request.responseType = 'json';
    const div = document.querySelector('div#link-info')
    div.classList.add('text-light', 'mt-3');
    div.innerHTML = '0%';

    // Progess indicator
    request.upload.addEventListener('progress', function(event) {
        const file1Size = file.size;

        if (event.loaded <= file1Size) {
            const percent = Math.round(event.loaded / file1Size * 100);
            div.innerHTML = percent + '%';
        }
    });

    request.onload = function(event) {
        if (request.status == 200) {
            div.innerHTML = `<p>Download link:</p><a class="h2" href="/download/${request.response}">${request.response.split(".").join(" ")}</a>`;
        } else {
            alert(request.statusText);
        }
    };

    request.open('POST', '/upload');
    request.timeout = 45000;
    request.send(formdata)
}

function dropHandler(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        // If the browser supports DataTransferItemList interface,
        // use getAsFile method to access the file(s)
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[i].kind === 'file') {
                var file = ev.dataTransfer.items[i].getAsFile();
                upload(file)
            } else {
                alert('Only files can be uploaded.')
            }
        }
    } else {
        // Use DataTransfer interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            upload(ev.dataTransfer.files[i].name)
        }
    }
}

function download(element) {
    if (event.keyCode == 13) { // 'enter' pressed
        var keywords = element.value;
        fetch('/download/' + keywords)
            .then(response => location.href = response.url)
            .catch(console.error);
    }
}